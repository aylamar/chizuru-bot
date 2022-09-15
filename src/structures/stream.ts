import { Streamer } from '@prisma/client';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { Logger } from 'winston';
import type { Chizuru } from '../interfaces';
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
            where: { followingChannels: { some: {} } },
            include: { followingChannels: { include: { guild: true } } },
        });
        if (!res) throw new NoStreamerError('No streamers found');

        let streamers: StreamerData[] = [];
        res.forEach(streamer => {
            let channels: FollowingChannels[] = streamer.followingChannels.map(channel => ({
                channelId: channel.channelId,
                pingRandomUser: channel.guild.streamPingRandomUser,
                streamPingRoleId: channel.guild.streamPingRoleId,
            }));
            streamers.push({
                id: streamer.id,
                platformId: streamer.platformId,
                platform: streamer.platform,
                username: streamer.username,
                displayName: streamer.displayName,
                avatarUrl: streamer.avatarUrl,
                isLive: streamer.isLive,
                followingChannels: channels,
                changeTime: streamer.statusChangeTime,
            });
        });

        return streamers;
    }

    private async initState() {
        let streamers: StreamerData[];
        try {
            streamers = await this.getStreamers();
        } catch (err) {
            if (err instanceof NoStreamerError) this.logger.info(`No streamers found while initialing state, continuing`, { label: 'streams' });
            return;
        }

        let liveStreamIds: number[] = [];
        let offlineStreamIds: number[] = [];

        const chunks = await this.generateChunks(streamers);
        for (const chunk of chunks) {
            const platformIds = chunk.map(streamer => streamer.platformId);
            const streamData: Chizuru.StreamData[] = await this.twitch.checkStreams(platformIds);
            const livePlatformIds = streamData.map(streamer => streamer.platformId);

            // if platform id is in livePlatformIds, then add to liveStreamIds
            for (const streamer of chunk) {
                if (livePlatformIds.includes(streamer.platformId)) liveStreamIds.push(streamer.id);
                else offlineStreamIds.push(streamer.id);
            }
        }

        let updateLive = prisma.streamer.updateMany({
            where: { id: { in: liveStreamIds } }, data: { isLive: true },
        });
        let updateOffline = prisma.streamer.updateMany({
            where: { id: { in: offlineStreamIds } }, data: { isLive: false },
        });

        await Promise.all([updateLive, updateOffline]);
        this.logger.info(`Initial stream state set, found ${ liveStreamIds.length } live streams,`
            + ` and ${ offlineStreamIds.length } offline streams`, { label: 'streams' });
    }

    private async updateState() {
        let streamers: StreamerData[];
        try {
            streamers = await this.getStreamers();
        } catch (err) {
            if (err instanceof NoStreamerError) return this.logger.info(`No streamers found, continuing`, { label: 'streams' });
            return this.logger.error(`Error while updating stream state:\n${ err }`, { label: 'streams' });
        }

        if (streamers.length === 0) return this.logger.info('No streamers found', { label: 'streams' });
        this.logger.info(`Updating stream state for ${ streamers.length } streamers`, { label: 'streams' });

        // generate chunks, then iterate through each chunks
        const chunks = await this.generateChunks(streamers);
        for (const chunk of chunks) {
            // join all userIds into a query string
            let platformIds = chunk.map(streamer => streamer.platformId);
            let streamData: Chizuru.StreamData[];
            let channelData: Chizuru.BulkChannelData[];
            try {
                channelData = await this.twitch.getChannels(platformIds);
                streamData = await this.twitch.checkStreams(platformIds);
            } catch (err) {
                this.logger.error(`Error while checking streams: ${ err }`, { label: 'streams' });
                return;
            }

            for (const streamer of chunk) {
                let isLive = false;
                let update: Promise<Streamer> | Streamer;
                let embed: Promise<EmbedBuilder> | EmbedBuilder;

                // find streamer and channel information from searches
                const stream = streamData.find(stream => stream.platformId === streamer.platformId);
                const channel = channelData.find(channel => channel.platformId === streamer.platformId);
                if (!stream && streamer.isLive) {
                    if (!channel) {
                        this.logger.warn(`No channel data found for ${ streamer.username }, were they banned?`, { label: 'streams' });
                        continue;
                    }
                    update = this.updateStreamer(streamer, false);
                    embed = this.createOfflineEmbed(streamer, channel);
                } else if (stream && !streamer.isLive) {
                    update = this.updateStreamer(streamer, true);
                    embed = this.createLiveEmbed(streamer, stream);
                    isLive = true;
                } else {
                    continue;
                }

                await Promise.all([update, embed]);
                for (const channel of streamer.followingChannels) {
                    await this.sendStreamNotification(channel, streamer, await embed, isLive);
                }
            }
        }
    }

    private async generateChunks(streamers: StreamerData[]) {
        let chunks: StreamerData[][] = [];
        let chunkSize = 100;
        for (let i = 0; i < streamers.length; i += chunkSize) {
            chunks.push(streamers.slice(i, i + chunkSize));
        }
        return chunks;
    }

    private async updateStreamer(streamer: StreamerData, isLive: boolean) {
        return prisma.streamer.update({
            where: { id: streamer.id },
            data: {
                isLive: isLive,
                statusChangeTime: new Date(),
                username: streamer.username,
                displayName: streamer.displayName,
            },
        });
    }

    private async createLiveEmbed(streamer: StreamerData, stream: Chizuru.StreamData) {
        let dateDiff = Streams.getDateDiff(streamer.changeTime);
        return generateEmbed({
            title: `${ streamer.displayName } has started streaming`,
            msg: `${ stream.title }\n\n` + `https://twitch.tv/${ streamer.username }`,
            author: streamer.displayName,
            authorIcon: streamer.avatarUrl,
            authorUrl: `https://twitch.tv/${ streamer.username }`,
            footer: `${ streamer.username } on ${ streamer.platform }`,
            image: stream.streamThumbnailUrl.replace('{width}', '620').replace('{height}', '360'),
            fields: [
                { name: 'Status', value: ':green_circle: Online', inline: true },
                { name: 'Game', value: `${ stream.gameName }`, inline: true },
                { name: 'Last Stream', value: `${ await dateDiff } ago`, inline: true }],
            color: this.client.colors.success,
            timestamp: true,
        });
    }

    private async createOfflineEmbed(streamer: StreamerData, channel: Chizuru.BulkChannelData) {
        let dateDiff = Streams.getDateDiff(streamer.changeTime);
        return generateEmbed({
            title: `${ streamer.displayName } has gone offline`,
            author: streamer.displayName,
            authorIcon: streamer.avatarUrl,
            authorUrl: `https://twitch.tv/${ streamer.username }`,
            footer: `${ streamer.username } on ${ streamer.platform }`,
            fields: [
                { name: 'Status', value: ':red_circle: Offline', inline: true },
                { name: 'Game', value: `${ channel.gameName }`, inline: true },
                { name: 'Stream Time', value: `${ await dateDiff }`, inline: true },
            ],
            color: this.client.colors.error,
            timestamp: true,
        });
    }

    private async sendStreamNotification(channel: FollowingChannels, streamer: StreamerData, embed: EmbedBuilder, isLive: boolean) {
        let textChannel = await this.client.channels.cache.get(channel.channelId) as TextChannel;
        if (!textChannel) {
            this.logger.warn(`Could not find channel ${ channel.channelId }`, { label: 'streams' });
            return;
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
            this.logger.error(`Error sending message to ${ textChannel.name } (${ channel.channelId }) `
                + `in ${ textChannel.guild.name }`, { label: 'streams' });
            this.logger.error(err);
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
    platformId: string;
    platform: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    isLive: boolean;
    followingChannels: FollowingChannels[];
    changeTime: Date;
}
