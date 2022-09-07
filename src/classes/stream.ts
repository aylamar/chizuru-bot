import { Streamer } from '@prisma/client';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { Logger } from 'winston';
import { prisma } from '../services';
import { generateEmbed, sendEmbed } from '../utils';
import { NoStreamerError } from '../utils/errors';
import { Bot } from './bot';
import Twitch from './twitch';

export class Streams {
    private logger: Logger;
    private twitch: Twitch;
    private client: Bot;

    public constructor(client: Bot) {
        this.logger = client.logger;
        this.twitch = client.twitch;
        this.client = client;
        void this.initState();

        // every minute, run updateState
        setInterval(() => {
            void this.updateState();
        }, 60 * 1000 * 2);
    }

    private static async getDateDiff(updateDate: Date) {
        // get datetime from 6 hours ago
        let date = new Date();
        date.setHours(date.getHours() - 6);

        let now = new Date();
        let timeDiff = Math.abs(now.getTime() - updateDate.getTime());

        let diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
        let diffHours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
        let diffMinutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));

        let timeString = '';
        if (diffDays > 0) timeString += `${ diffDays } days, `;
        if (diffHours > 0) timeString += `${ diffHours } hours, `;
        if (diffMinutes > 0) timeString += `${ diffMinutes } minutes, `;
        return timeString.slice(0, -2);
    }

    private async getStreamers(): Promise<StreamerData[]> {
        const res = await prisma.streamer.findMany({
            where: {
                followingChannels: {
                    some: {},
                },
            },
            include: {
                followingChannels: {
                    include: {
                        guild: true,
                    },
                },
            },
        });
        if (!res) throw new NoStreamerError('No streamers found');

        let streamers: StreamerData[] = [];
        res.forEach(streamer => {
            let channels: FollowingChannels[] = streamer.followingChannels.map(channel => ({
                    channelId: channel.channelId,
                    pingRandomUser: channel.guild.streamPingRandomUser,
                    streamPingRoleId: channel.guild.streamPingRoleId,
                }),
            );
            streamers.push({
                id: streamer.id,
                username: streamer.username,
                displayName: streamer.displayName,
                platform: streamer.platform,
                avatarUrl: streamer.avatarUrl,
                isLive: streamer.isLive,
                followingChannels: channels,
                changeTime: streamer.statusChangeTime,
            });
        });

        return streamers;
    }

    private async initState() {
        let streamers: StreamerData[]
        try {
            streamers = await this.getStreamers();
        } catch (err) {
            if (err instanceof NoStreamerError) this.logger.info(`No streamers found while initialing state, continuing`, { label: 'streams' });
            return;
        }

        let liveStreamIds: number[] = [];
        let offlineStreamIds: number[] = [];

        for (const streamer of streamers) {
            let channelData = await this.twitch.getChannel(streamer.username);
            if (channelData.isLive) liveStreamIds.push(streamer.id);
            else offlineStreamIds.push(streamer.id);
        }

        let updateLive = prisma.streamer.updateMany({
            where: { id: { in: liveStreamIds } },
            data: { isLive: true },
        });
        let updateOffline = prisma.streamer.updateMany({
            where: { id: { in: offlineStreamIds } },
            data: { isLive: false },
        });

        await Promise.all([updateLive, updateOffline]);
        this.logger.info(`Initial stream state set, found ${ liveStreamIds.length } live streams,`
            + ` and ${ offlineStreamIds.length } offline streams`, { label: 'streams' });
    }

    private async updateState() {
        let streamers: StreamerData[]
        try {
            streamers = await this.getStreamers();
        } catch (err) {
            if (err instanceof NoStreamerError) this.logger.info(`No streamers found, continuing`, { label: 'streams' });
            return;
        }

        if (streamers.length === 0) {
            this.logger.info('No streamers found', { label: 'streams' });
            return;
        }
        this.logger.info(`Updating stream state for ${ streamers.length } streamers`, { label: 'streams' });

        for (const streamer of streamers) {
            let isLive = false;
            let update: Promise<Streamer>;
            let embed: Promise<EmbedBuilder>;
            let channelData = await this.twitch.getChannel(streamer.username);
            if (!channelData.isLive && streamer.isLive) {
                let dateDiff = Streams.getDateDiff(streamer.changeTime);
                update = prisma.streamer.update({
                    where: { id: streamer.id },
                    data: { isLive: false, avatarUrl: channelData.thumbnailUrl, statusChangeTime: new Date() },
                });

                embed = generateEmbed({
                    title: `${ streamer.displayName } has gone offline`,
                    author: streamer.displayName,
                    authorIcon: streamer.avatarUrl,
                    authorUrl: `https://twitch.tv/${ streamer.username }`,
                    footer: `${ streamer.username } on ${ streamer.platform }`,
                    fields: [
                        { name: 'Status', value: ':red_circle: Offline', inline: true },
                        { name: 'Game', value: `${ channelData.gameName }`, inline: true },
                        { name: 'Stream Time', value: `${ await dateDiff }`, inline: true },
                    ],
                    color: this.client.colors.error,
                    timestamp: true,
                });
            } else if (channelData.isLive && !streamer.isLive) {
                const streamData = await this.twitch.checkStream(streamer.username);
                if (streamData === false) {
                    this.logger.warn(`${ streamer.displayName } is live but has no stream data, skipping for now`, { label: 'streams' });
                    continue;
                }

                let dateDiff = Streams.getDateDiff(streamer.changeTime);
                update = prisma.streamer.update({
                    where: { id: streamer.id },
                    data: { isLive: true, avatarUrl: channelData.thumbnailUrl, statusChangeTime: new Date() },
                });

                embed = generateEmbed({
                    title: `${ streamer.displayName } has started streaming`,
                    msg: `${ streamData.title }\n\n` + `https://twitch.tv/${ streamer.username }`,
                    author: streamer.displayName,
                    authorIcon: streamer.avatarUrl,
                    authorUrl: `https://twitch.tv/${ streamer.username }`,
                    footer: `${ streamer.username } on ${ streamer.platform }`,
                    image: streamData.streamThumbnailUrl.replace('{width}', '620').replace('{height}', '360'),
                    fields: [
                        { name: 'Status', value: ':green_circle: Offline', inline: true },
                        { name: 'Game', value: `${ channelData.gameName }`, inline: true },
                        { name: 'Last Stream', value: `${ await dateDiff } ago`, inline: true },
                    ],
                    color: this.client.colors.success,
                    timestamp: true,
                });
                isLive = true;
            } else {
                continue;
            }

            await Promise.all([update, embed]);

            // get all channel ids that are following this streamer
            for (const channel of streamer.followingChannels) {
                let textChannel = await this.client.channels.cache.get(channel.channelId) as TextChannel;
                if (!textChannel) {
                    this.logger.warn(`Could not find channel ${ channel.channelId }`, { label: 'streams' });
                    continue;
                }
                let message: string | undefined;

                if (isLive && channel.streamPingRoleId === '@everyone') message = `@everyone`;
                else if (isLive && channel.streamPingRoleId) message = `<@&${ channel.streamPingRoleId }>`;

                if (isLive && channel.pingRandomUser) {
                    // get a random user online in the text channel
                    let user = await textChannel.members.random();
                    if (user && channel.streamPingRoleId) {
                        message = message + `, specifically <@${ user.id }>`;
                    } else if (user && !channel.streamPingRoleId) {
                        message = `<@${ user.id }> ${ streamer.displayName } is live!`;
                    }
                }

                try {
                    await sendEmbed(textChannel, await embed, message);
                } catch (err) {
                    this.logger.error(`Error sending message to ${ textChannel.name } (${ channel.channelId }) in ${ textChannel.guild.name }`, { label: 'streams' });
                    this.logger.error(err);
                }
            }
        }
    }
}

interface FollowingChannels {
    channelId: string;
    pingRandomUser: boolean;
    streamPingRoleId: string | null;
}

interface StreamerData {
    id: number;
    username: string;
    displayName: string;
    platform: string;
    avatarUrl: string;
    isLive: boolean;
    followingChannels: FollowingChannels[];
    changeTime: Date;
}
