import { StreamPlatform } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import {
    EmbedBuilder,
    PermissionFlagsBits,
    PermissionsString,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { ChannelData, Field, RunCommand } from '../../interfaces';
import { prisma } from '../../services';
import { deferReply, generateEmbed, generateErrorEmbed, replyEmbed } from '../../utils';

export const run: RunCommand = async (client, interaction) => {
    if (!interaction.inCachedGuild()) return;
    const subCommand = interaction.options.getSubcommand();
    let embed: EmbedBuilder | Promise<EmbedBuilder>;

    let defer = deferReply(interaction);
    const streamer = interaction.options.getString('streamer');
    const channel = interaction.options.getChannel('channel');
    const platform = interaction.options.getString('platform');

    switch (subCommand) {
        case 'list':
            const res = await prisma.guild.findUnique({
                where: { guildId: interaction.guild.id },
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

            if (!res || !res.channels) {
                embed = generateEmbed({
                    msg: `No stream alerts are set up for this server.`,
                });
                break;
            }

            let fields: Field[] = [];
            let streamCount = 0;
            res.channels.map(channel => {
                channel.followedStreamers.forEach(streamer => {
                    streamCount++;
                    fields.push({
                        name: `${ streamer.username } (${ streamer.platform })`,
                        value: `<#${ channel.channelId }>`,
                        inline: true,
                    });
                });
            });

            if (streamCount === 0) {
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
                embed = generateEmbed({ 'msg': 'Please provide a streamer, channel and platform.' });
                break;
            }

            try {
                await disconnectStreamer(streamer, platform as StreamPlatform, channel.id);
                embed = generateEmbed({
                    msg: `You'll no longer be notified in <#${ channel.id }> when ${ streamer } goes live on ${ platform }.`,
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

};

export const name: string = 'stream';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages'];

export const data: SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder()
    .setName('stream')
    .setDescription('Update and view stream notification settings here')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand(subcommand => subcommand.setName('list')
        .setDescription('List the current settings for the server'))
    .addSubcommand(subcommand => subcommand.setName('add')
        .setDescription('Enable notifications for when a streamer goes live in a channel')
        .addChannelOption(option => option.setName('channel')
            .setDescription('The channel to send the notification to')
            .setRequired(true))
        .addStringOption(option => option.setName('platform')
            .setDescription('The platform the streamer is on')
            .setRequired(true)
            .addChoices(
                { name: 'twitch', value: 'twitch' },
            ))
        .addStringOption(option => option.setName('streamer')
            .setDescription('The streamer\'s username')
            .setRequired(true)),
    )
    .addSubcommand(subcommand => subcommand.setName('remove')
        .setDescription('Disable notifications for a streamer in a channel')
        .addChannelOption(option => option.setName('channel')
            .setDescription('The channel to disable notifications in')
            .setRequired(true))
        .addStringOption(option => option.setName('platform')
            .setDescription('The platform the streamer is on')
            .setRequired(true)
            .addChoices(
                { name: 'twitch', value: 'twitch' },
            ))
        .addStringOption(option => option.setName('streamer')
            .setDescription('The streamer\'s username')
            .setRequired(true)),
    );

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

async function disconnectStreamer(streamer: string, platform: StreamPlatform, channelId: string) {
    return await prisma.streamer.update({
        where: {
            username_platform: {
                username: streamer,
                platform: StreamPlatform.twitch,
            },
        },
        data: { followingChannels: { disconnect: { channelId: channelId } } },
    });

}

async function upsertStreamer(streamerData: ChannelData, connectQuery: ChannelConnectQuery) {
    return await prisma.streamer.upsert({
        where: {
            username_platform: {
                username: streamerData.username,
                platform: StreamPlatform.twitch,
            },
        },
        create: {
            username: streamerData.username,
            displayName: streamerData.displayName,
            platform: StreamPlatform.twitch,
            avatarUrl: streamerData.thumbnailUrl,
            isLive: streamerData.isLive,
            followingChannels: {
                connectOrCreate: connectQuery,
            },
        },
        update: {
            followingChannels: {
                connectOrCreate: connectQuery,
            },
        },
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