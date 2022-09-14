import { Starboard } from '@prisma/client';
import { ApplicationCommandOptionType, Channel, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Chizuru } from '../../interfaces';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Command } from '../../structures/command';
import { deferReply, generateEmbed, generateErrorEmbed, NoStarboardError, replyEmbed, updateArray } from '../../utils';

export default new Command({
    name: 'starboard',
    description: 'Create starboards or update starboard settings on the server',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['ManageGuild'],
    module: Chizuru.CommandModule.Global,
    options: [
        {
            name: 'create',
            description: 'Create a stream notification channel',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'The channel to create the starboard in',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
                {
                    name: 'emote',
                    description: 'The emote to use for the starboard',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'threshold',
                    description: 'The amount of the emote reactions required to post to the starboard',
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
            ],
        },
        {
            name: 'delete',
            description: 'Delete a stream notification channel',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'The channel to delete the starboard from',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
            ],
        },
        {
            name: 'blacklist',
            description: 'Blacklist a channel or user from being posted to the starboard',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'channel',
                    description: 'Blacklist a channel from being posted to the starboard',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'channel',
                            description: 'The channel of the starboard to blacklist the channel from',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        },
                        {
                            name: 'target',
                            description: 'The channel to blacklist from the starboard',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        },
                        {
                            name: 'blacklisted',
                            description: 'Whether the channel is blacklisted or not',
                            type: ApplicationCommandOptionType.Boolean,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'user',
                    description: 'Blacklist a user from being posted to the starboard',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'channel',
                            description: 'The channel of the starboard to blacklist the channel from',
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                        },
                        {
                            name: 'target',
                            description: 'The user to blacklist from the starboard',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: 'blacklisted',
                            description: 'Whether the channel is blacklisted or not',
                            type: ApplicationCommandOptionType.Boolean,
                            required: true,
                        },
                    ],

                },
            ],
        },
    ],

    execute: async (client, interaction) => {
        if (!interaction.inGuild()) return;

        const option = interaction.options.getSubcommand();
        const group = interaction.options.getSubcommandGroup();
        const defer = deferReply(interaction);
        let embed: Promise<EmbedBuilder>;

        if (group === 'blacklist') {
            embed = handleBlacklist(option, interaction, client);
        } else {
            switch (option) {
                case 'create':
                    embed = handleCreate(interaction, client);
                    break;
                case 'delete':
                    embed = handleDelete(interaction, client);
                    break;
                default:
                    embed = generateEmbed({ msg: 'This command is not yet implemented.', color: client.colors.error });
                    break;
            }
        }

        await defer;
        await replyEmbed(interaction, await embed);
    },
});

async function handleCreate(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, client: Bot): Promise<EmbedBuilder> {
    const createChannel = interaction.options.getChannel('channel', true);
    const emote = interaction.options.getString('emote', true).toLowerCase();
    const count = interaction.options.getInteger('count', true);

    let channel = client.channels.cache.get(createChannel.id);
    if (!channel || !channel.isTextBased() || channel.isDMBased() || channel.isThread() || channel.isVoiceBased()) {
        return generateEmbed({
            title: 'Starboard',
            msg: 'The channel you provided is not a valid channel.',
            color: client.colors.error,
        });
    }

    try {
        await prisma.starboard.create({
            data: {
                guildId: interaction.guildId,
                channelId: channel.id,
                emoteCount: count,
                emote: emote,
            },
        });
    } catch (err: any) {
        // if error code is P2002, then the starboard already exists
        if (err.code === 'P2002') {
            return generateEmbed({
                title: 'Starboard',
                msg: `A starboard already exists for <#${ channel.id }>, you'll need to edit it or delete it.`,
                color: client.colors.error,
            });
        }
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }

    return generateEmbed({
        title: 'Starboard',
        msg: `Successfully created a starboard for <#${ channel.id }> with ${ count } ${ emote }'s.`,
        color: client.colors.success,
    });
}

async function handleDelete(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, client: Bot): Promise<EmbedBuilder> {
    const channel = interaction.options.getChannel('channel', true);
    try {
        await prisma.starboard.delete({ where: { channelId: channel.id } });
    } catch (err: any) {
        // if error code is P2025, then no starboard exists for that channel
        if (err.code === 'P2025') {
            return generateEmbed({
                title: 'Starboard',
                msg: `No starboard was deleted, a starboard does not exist for <#${ channel.id }>`,
                color: client.colors.error,
            });
        }
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }

    return generateEmbed({
        title: 'Starboard',
        msg: `Successfully deleted the starboard for <#${ channel.id }>`,
        color: client.colors.success,
    });
}

async function handleBlacklist(option: string, interaction: ChatInputCommandInteraction<'cached' | 'raw'>, client: Bot): Promise<EmbedBuilder> {
    const starboard = interaction.options.getChannel('channel', true);
    const blacklisted = interaction.options.getBoolean('blacklisted', true);
    // if target is a channel, then it's a channel blacklist, otherwise it's a user blacklist
    let id: string;

    if (option === 'channel') {
        const target = interaction.options.getChannel('target', true);
        let apiChannel: Channel | undefined | null = client.channels.cache.get(target.id);
        apiChannel = apiChannel ?? await client.channels.fetch(target.id);
        if (!apiChannel || !apiChannel.isTextBased() || apiChannel.isDMBased()) {
            return generateEmbed({
                title: 'Starboard',
                msg: 'Please provide a valid text channel.',
                color: client.colors.error,
            });
        }
        id = target.id;
    } else {
        const target = interaction.options.getUser('user', true);
        id = target.id;
    }
    if (!id) return generateEmbed({
        title: 'Starboard',
        msg: 'Please provide a valid channel or user.',
        color: client.colors.error,
    });

    let currentIds: string[];
    try {
        currentIds = await getStarboardIds(option, starboard.id);
    } catch (err: any) {
        if (err instanceof NoStarboardError) {
            return generateEmbed({
                title: 'Starboard',
                msg: err.message,
                color: client.colors.error,
            });
        }
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }

    const updatedIds = updateArray(currentIds, id, blacklisted);
    const setting = convertStarboardSettings(option);

    await prisma.starboard.update({
        where: { channelId: starboard.id },
        data: { [await setting]: await updatedIds },
    });

    let idString: string;
    if (option === 'channel') {
        idString = `<@${ id }>`;
    } else if (option === 'user') {
        idString = `<#${ id }>`;
    } else {
        idString = 'Invalid';
    }

    return generateEmbed({
        title: 'Starboard',
        color: client.colors.success,
        msg: `Successfully ${ blacklisted ? 'added' : 'removed' } ${ option } ${ idString } from the <#${ starboard.id }> Starboard blacklist.`,
    });
}

/*

    helper functions

 */
async function getStarboardIds(setting: string, channelId: string) {
    let guild = await prisma.starboard.findUnique({ where: { channelId: channelId } });
    if (!guild) throw new NoStarboardError('No starboard exists for this channel.');

    switch (setting) {
        case 'channel':
            return guild.blacklistedChannelIds;
        case 'user':
            return guild.blacklistedUserIds;
        default:
            return [];
    }
}

async function convertStarboardSettings(setting: string): Promise<keyof Starboard> {
    switch (setting) {
        case 'channel':
            return 'blacklistedChannelIds';
        case 'user':
            return 'blacklistedUserIds';
        default:
            throw new Error('Invalid setting');
    }
}
