import { Channel, StreamPlatform } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ApplicationCommandOptionType, EmbedBuilder, GuildTextBasedChannel } from 'discord.js';
import type { Bot } from '../../classes/bot';
import { Command, CommandModule } from '../../classes/command';
import { ChannelData, Field } from '../../interfaces';
import { prisma } from '../../services';
import { deferReply, generateEmbed, generateErrorEmbed, replyEmbed } from '../../utils';

export default new Command({
    name: 'stream',
    description: 'Update and view stream notification settings here',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['ManageGuild'],
    module: CommandModule.Global,
    options: [
        {
            name: 'list',
            description: 'List all followed streamers',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'add',
            description: 'Enable notifications for when a streamer goes live in a channel',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'The channel to enable notifications in',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
                {
                    name: 'platform',
                    description: 'The platform the streamer is on',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: 'Twitch', value: 'twitch' },
                    ],
                },
                {
                    name: 'username',
                    description: 'The username of the streamer',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: 'remove',
            description: 'Disable notifications for when a streamer goes live in a channel',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'The channel to disable notifications in',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
                {
                    name: 'platform',
                    description: 'The platform the streamer is on',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: 'Twitch', value: 'twitch' },
                    ],
                },
                {
                    name: 'username',
                    description: 'The username of the streamer',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
    ],

    execute: async (client, interaction) => {
        if (!interaction.inCachedGuild()) return;
        const subCommand = interaction.options.getSubcommand();
        let embed: EmbedBuilder | Promise<EmbedBuilder> | EmbedBuilder[] | Promise<EmbedBuilder[]>;

        let defer = deferReply(interaction);
        const streamer = interaction.options.getString('streamer');
        const channel = interaction.options.getChannel('channel');
        const platform = interaction.options.getString('platform');

        switch (subCommand) {
            case 'list':
                const res = await getFollowedStreams(interaction.guildId);
                if (!res || !res.channels) {
                    embed = generateEmbed({
                        msg: `No stream alerts are set up for this server.`,
                    });
                    break;
                }

                const fields: Field[] = await generateFields(res.channels, client);
                if (fields.length === 0) {
                    embed = generateEmbed({
                        msg: `No stream alerts are set up for this server.`,
                    });
                    break;
                }
                embed = generateEmbed({
                    title: `Stream alerts for ${ interaction.guild.name }`,
                    color: client.colors.twitch,
                    fields: fields,
                });
                break;
            case 'add':
                if (!streamer || !channel || !platform) {
                    embed = generateEmbed({ 'msg': 'Please provide a streamer, channel and platform.' });
                    break;
                }

                try {
                    const connectQuery = generateConnectChannelQuery(channel.id, channel.guild.id);
                    const streamerData = await client.twitch.getChannel(streamer);
                    client.logger.info(`Adding streamer ${ streamerData.displayName } to channel ${ channel.id } on ${ platform }`);

                    if (!channel.isTextBased() || channel.isDMBased() || channel.isThread()) {
                        embed = generateEmbed({
                            msg: `${ channel.name } is not a text channel, please select a text channel.`,
                            color: client.colors.error,
                        });
                        break;
                    }

                    await upsertStreamer(streamerData, await connectQuery);
                    embed = generateEmbed({
                        msg: `You'll be notified in <#${ channel.id }> when ${ streamerData.displayName }`
                            + ` goes live on ${ platform.charAt(0).toUpperCase() + platform.slice(1) }.`,
                        authorIcon: `${ streamerData.thumbnailUrl }`,
                        author: `${ streamerData.displayName }`,
                        authorUrl: `${ streamerData.url }`,
                        color: client.colors.success,
                    });
                } catch (err: any) {
                    embed = generateErrorEmbed(err, client.colors.error, client.logger);
                }
                break;
            case 'remove':
                if (!streamer || !channel || !platform) {
                    embed = generateEmbed({
                        'msg': 'Please provide a streamer, channel and platform.',
                        color: client.colors.success,
                    });
                    break;
                }

                try {
                    const streamers = await prisma.streamer.findMany({
                        where: { username: streamer.toLowerCase(), platform: StreamPlatform.twitch },
                    });

                    if (streamers.length > 0) {
                        let platformId = streamers.filter(dbStreamer => dbStreamer.username === streamer.toLowerCase())[0].platformId;
                        if (platformId) await disconnectStreamer(platformId, platform as StreamPlatform, channel.id);
                    }

                    embed = generateEmbed({
                        msg: `You'll no longer be notified in <#${ channel.id }> when ${ streamer } goes live on ${ platform }.`,
                        color: client.colors.success,
                    });
                } catch (err: any) {
                    if (err instanceof PrismaClientKnownRequestError) {
                        embed = generateEmbed({
                            msg: `You weren't following ${ streamer } on ${ platform } in <#${ channel.id }>.`,
                            color: client.colors.success,
                        });
                    } else {
                        embed = generateErrorEmbed(err, client.colors.error, client.logger);
                    }
                }
                break;
            default:
                embed = generateEmbed({
                    msg: 'Invalid subcommand',
                    color: client.colors.error,
                });
                break;
        }

        await defer;
        await replyEmbed(interaction, await embed);
    },
});

async function getFollowedStreams(guildId: string) {
    return await prisma.guild.findUnique({
        where: { guildId: guildId },
        include: {
            channels: {
                include: {
                    followedStreamers: {
                        select: {
                            username: true,
                            displayName: true,
                            platform: true,
                        },
                    },
                },
            },
        },
    });
}

async function generateFields(channels: (Channel & { followedStreamers: { username: string, platform: 'twitch', displayName: string }[] })[], client: Bot): Promise<Field[]> {
    let fields: Field[] = [];
    channels.filter(channel => channel.followedStreamers.length > 0).map(channel => {
        let streamers: string[] = [];
        channel.followedStreamers.forEach(streamer => {
            streamers.push(`${ streamer.username } (${ streamer.platform })`);
        });

        // needed to get the channel name
        const cachedChannel = client.channels.cache.get(channel.channelId) as GuildTextBasedChannel;

        streamers.sort();
        fields.push({
            name: `${ cachedChannel.name ? `#${ cachedChannel.name } followed streams` : 'Unknown Channel' }`,
            value: `${ streamers.join('\n') }`,
            inline: true,
        });
    });
    return fields;
}

async function generateConnectChannelQuery(channelId: string, guildId: string): Promise<ChannelConnectQuery> {
    return {
        where: { channelId: channelId },
        create: {
            channelId: channelId,
            guild: {
                connectOrCreate: {
                    where: { guildId: guildId },
                    create: { guildId: guildId },
                },
            },
        },
    };
}

async function disconnectStreamer(platformId: string, platform: StreamPlatform, channelId: string) {
    return await prisma.streamer.update({
        where: {
            platformId_platform: {
                platformId: platformId,
                platform: StreamPlatform.twitch,
            },
        },
        data: { followingChannels: { disconnect: { channelId: channelId } } },
    });

}

async function upsertStreamer(streamerData: ChannelData, connectQuery: ChannelConnectQuery) {
    return await prisma.streamer.upsert({
        where: {
            platformId_platform: {
                platformId: streamerData.platformId,
                platform: StreamPlatform.twitch,
            },
        },
        create: {
            platformId: streamerData.platformId,
            platform: StreamPlatform.twitch,
            username: streamerData.username,
            displayName: streamerData.displayName,
            avatarUrl: streamerData.thumbnailUrl,
            isLive: streamerData.isLive,
            followingChannels: { connectOrCreate: connectQuery },
        },
        update: { followingChannels: { connectOrCreate: connectQuery } },
    });
}

interface ChannelConnectQuery {
    where: { channelId: string },
    create: {
        channelId: string,
        guild: {
            connectOrCreate: {
                where: { guildId: string },
                create: { guildId: string },
            }
        }
    },
}
