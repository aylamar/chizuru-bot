import { Guild, Starboard } from '@prisma/client';
import { ApplicationCommandOptionType, EmbedBuilder, GuildBasedChannel, Role } from 'discord.js';
import { Chizuru } from '../../interfaces';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Command } from '../../structures/command';
import { deferReply, generateEmbed, generateErrorEmbed, replyEmbed, updateArray } from '../../utils';

export default new Command({
    name: 'settings',
    description: 'Search for a video on YouTube by title',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['ManageGuild'],
    module: Chizuru.CommandModule.Global,
    options: [
        {
            name: 'list',
            description: 'List the current settings for the server',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'filter',
            description: 'Add or remove a filtered string',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'string',
                    description: 'The string to filter',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: 'enabled',
                    description: 'Whether or not the string should be filtered',
                    type: ApplicationCommandOptionType.Boolean,
                    required: true,
                },
            ],
        },
        {
            name: 'stream-ping',
            description: 'Update the stream ping settings for the server',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'enabled',
                    description: 'Whether or not the setting should be enabled',
                    type: ApplicationCommandOptionType.Boolean,
                    required: true,
                },
                {
                    name: 'role',
                    description: 'The role to ping when a stream goes live',
                    type: ApplicationCommandOptionType.Role,
                    required: false,
                },
            ],
        },
        {
            name: 'log',
            description: 'Enable or disable a logging setting for a channel',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'setting',
                    description: 'The setting to update',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: 'Blacklist Channel From Logs', value: 'logBlacklistedChannels' },
                        { name: 'Log Deleted Messages', value: 'logDeletedMessagesChannels' },
                        { name: 'Log Edited Messages', value: 'logEditedMessagesChannels' },
                        { name: 'Log Voice Status Changes', value: 'logVoiceStateChannels' },
                    ],
                },
                {
                    name: 'channel',
                    description: 'The channel to enable or disable the setting for',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                },
                {
                    name: 'enabled',
                    description: 'Whether or not the setting should be enabled',
                    type: ApplicationCommandOptionType.Boolean,
                    required: true,
                },
            ],
        },
        {
            name: 'music-channel',
            description: 'Set the music channel for the server',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'enabled',
                    description: 'Whether or not the setting should be enabled',
                    type: ApplicationCommandOptionType.Boolean,
                    required: true,
                },
                {
                    name: 'channel',
                    description: 'The channel to set as the music channel',
                    type: ApplicationCommandOptionType.Channel,
                    required: false,
                },
            ],
        },
    ],

    execute: async (client, interaction) => {
        if (!interaction.inCachedGuild()) return;
        const subCommand = interaction.options.getSubcommand();

        const defer = deferReply(interaction);
        let embed: Promise<EmbedBuilder>;
        const setting = interaction.options.getString('setting');
        const enabled = interaction.options.getBoolean('enabled');
        const channel = interaction.options.getChannel('channel');

        switch (subCommand) {
            case 'list':
                embed = handleList(interaction.guildId, client);
                break;
            case 'log':
                embed = handleLog(setting, enabled, channel, client);
                break;
            case 'music-channel':
                embed = handleMusicChannel(enabled, channel, interaction.guildId, client);
                break;
            case 'stream-ping':
                const role = interaction.options.getRole('role');
                embed = handlePing(setting, enabled, role, interaction.guildId, client);
                break;
            case 'filter':
                embed = handleFilter(interaction.options.getString('string', true), interaction.options.getBoolean('enabled', true), interaction.guildId, client);
                break;
            case 'update':
                embed = handleUpdate(setting, enabled, interaction.guildId, client);
                break;
            default:
                embed = generateEmbed({
                    title: 'Settings',
                    msg: `${ subCommand } does not exist, please enter a valid command.`,
                    color: client.colors.error,
                });
                break;
        }

        await defer;
        await replyEmbed(interaction, await embed);
    },
});

async function handleList(guildId: string, client: Bot): Promise<EmbedBuilder> {
    let guild = await prisma.guild.findUnique({ where: { guildId }, include: { starboards: true } });
    if (!guild) {
        await prisma.guild.upsert({
            where: { guildId },
            create: { guildId },
            update: { guildId },
            include: { starboards: true },
        });
        return generateEmbed({
            title: 'Settings',
            msg: 'No settings found for this guild, please re-run this command momentarily.',
            color: client.colors.error,
        });
    }

    let fields: Chizuru.Field[] = await generateSettingsFields(guild);
    return generateEmbed({
        title: 'Settings',
        fields: fields,
        color: client.colors.purple,
    });
}

async function handleLog(setting: string | null, enabled: boolean | null, channel: GuildBasedChannel | null, client: Bot) {
    if (!setting || !channel || enabled === undefined) {
        return generateEmbed({
            title: 'Settings',
            msg: 'Please provide a setting, a channel, and whether or not the setting should be enabled.',
            color: client.colors.error,
        });
    }

    let settingName = convertSettingToName(setting);
    let currentChannels = await getCurrentChannels(setting, channel.guildId);
    let updatedChannels = await updateArray(currentChannels, channel.id, enabled);

    if (!channel.isTextBased() || channel.isDMBased() || channel.isThread()) {
        return generateEmbed({
            title: 'Settings',
            msg: `${ channel.name } is not a text channel, please select a text channel.`,
            color: client.colors.error,
        });
    }

    try {
        await prisma.guild.upsert({
            where: { guildId: channel.guildId },
            create: { guildId: channel.guildId },
            update: { [setting]: updatedChannels },
        });

        return generateEmbed({
            title: 'Settings',
            color: client.colors.success,
            msg: `${ await settingName } has been ${ enabled ? 'enabled' : 'disabled' } for <#${ channel.id }>`,
        });
    } catch (err: any) {
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }
}

async function handleMusicChannel(enabled: boolean | null, channel: GuildBasedChannel | null, guildId: string, client: Bot) {
    if (enabled === null || (!channel && enabled)) {
        return generateEmbed({
            title: 'Settings',
            msg: 'A channel must be provided when locking music commands to a specific channel.',
            color: client.colors.error,
        });
    }

    if (!enabled) {
        await upsertStringSetting(guildId, 'musicChannelId', null);
        return generateEmbed({
            title: 'Settings',
            msg: 'Music commands can now be used in any channel.',
            color: client.colors.success,
        });
    }

    if (!channel || !channel.isTextBased()) {
        return generateEmbed({
            title: 'Settings',
            msg: 'The music channel must be a text channel.',
            color: client.colors.error,
        });
    }
    await upsertStringSetting(guildId, 'musicChannelId', channel.id);

    return generateEmbed({
        title: 'Settings',
        msg: `Music commands can now only be used in ${ channel }`,
        color: client.colors.success,
    });
}

async function handlePing(setting: string | null, enabled: boolean | null, role: Role | null, guildId: string, client: Bot): Promise<EmbedBuilder> {
    if (enabled === undefined || (enabled === true && !role)) {
        return generateEmbed({
            title: 'Settings',
            msg: 'While enabling stream pings, a role must be selected',
            color: client.colors.error,
        });
    }

    let roleId: string | null = null;
    if (enabled === true && role) roleId = roleId = role.name === '@everyone' ? '@everyone' : role.id;

    try {
        await prisma.guild.upsert({
            where: { guildId: guildId },
            update: { streamPingRoleId: roleId },
            create: { guildId },
        });
    } catch (err: any) {
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }

    return generateEmbed({
        title: 'Settings',
        msg: `Stream pings have been ${ enabled ? `enabled ${ 'for' + role?.name }` : 'disabled' }.`,
        color: client.colors.success,
    });
}

async function handleUpdate(setting: string | null, enabled: boolean | null, guildId: string, client: Bot): Promise<EmbedBuilder> {
    if (!setting || enabled === undefined) {
        return generateEmbed({
            title: 'Settings',
            msg: 'Please provide a setting and whether or not the setting should be enabled.',
            color: client.colors.error,
        });
    }
    let settingName = convertSettingToName(setting);

    try {
        await prisma.guild.upsert({
            where: { guildId },
            update: { [setting]: enabled },
            create: { guildId },
        });
        return generateEmbed({
            title: 'Settings',
            msg: `${ await settingName } has been set to ${ enabled ? 'enabled' : 'disabled' }.`,
            color: client.colors.success,
        });
    } catch (err: any) {
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }
}

async function handleFilter(string: string, enabled: boolean, guildId: string, client: Bot): Promise<EmbedBuilder> {
    const guild = await prisma.guild.findUnique({ where: { guildId } });
    const currentFilters = guild?.filteredStrings || [];

    const updatedFilters = await updateArray(currentFilters, string.toLowerCase(), enabled);

    try {
        await prisma.guild.upsert({
            where: { guildId },
            update: { filteredStrings: updatedFilters },
            create: { guildId, filteredStrings: updatedFilters },
        });
        return generateEmbed({
            title: 'Settings',
            msg: `The filter has been ${ enabled ? 'enabled' : 'disabled' } for ${ string }`,
            color: client.colors.success,
        });
    } catch (err: any) {
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }
}

/*

    helper functions

 */
async function generateSettingsFields(guild: (Guild & { starboards: Starboard[] })): Promise<Chizuru.Field[]> {
    const logField: Chizuru.Field = {
        name: 'Log Settings',
        value: `\nLog edited messages: ${ await genChannelList(guild.logEditedMessagesChannels) }`
            + `\nLog deleted messages: ${ await genChannelList(guild.logDeletedMessagesChannels) }`
            + `\nLog voice status changes: ${ await genChannelList(guild.logVoiceStateChannels) }`
            + `\nChannels blacklisted from logging: ${ await genChannelList(guild.logBlacklistedChannels) }`,
        inline: false,
    };

    const musicField: Chizuru.Field = {
        name: 'Music Settings',
        value: `\nMusic commands can be run in ${ guild.musicChannelId ? `<#${ guild.musicChannelId }>` : 'any channel' }`,
        inline: false,
    };

    const filteredStrings = guild.filteredStrings.map((str) => `"${ str }"`);
    const filterField: Chizuru.Field = {
        name: 'Filtered Strings',
        value: filteredStrings.length > 0 ? filteredStrings.join(', ') : 'No strings are currently filtered.',
        inline: false,
    }

    let role: string;
    if (guild.streamPingRoleId === '@everyone') role = '@everyone';
    else role = `<@&${ guild.streamPingRoleId }>`;

    const streamField: Chizuru.Field = {
        name: 'Stream Settings',
        value: `\nStream pings for random users are ${ guild.streamPingRandomUser ? 'enabled' : 'disabled' }`
            + `\nStream pings for specific roles are ${ guild.streamPingRoleId ? `enabled for ${ role }` : 'disabled' }`,
        inline: false,
    };

    let fields = [logField, filterField, musicField, streamField];
    if (guild.starboards.length > 0) {
        // iterate through each starboard
        for (let starboard of guild.starboards) {
            let starboardField: Chizuru.Field = {
                name: 'Starboard Settings',
                value: `Channel: <#${ starboard.channelId }>`
                    + `\nEmote: ${ starboard.emote }`
                    + `\nRequired ${ starboard.emote }: ${ starboard.emoteCount }`
                    + `\nBanned Users: ${ starboard.blacklistedUserIds ? starboard.blacklistedUserIds.map((id) => {
                        return `<@${ id }>`;
                    }).join(', ') : 'None' }`
                    + `\nBlacklisted Channels: ${ starboard.blacklistedChannelIds ? starboard.blacklistedChannelIds.map((id) => {
                        return `<#${ id }>`;
                    }).join(', ') : 'None' }`,
                inline: false,
            };
            fields.push(starboardField);
        }
    }
    return fields;
}

async function genChannelList(channels: string[]) {
    if (channels.length > 0) {
        return channels.map((id) => {
            return `<#${ id }>`;
        }).join(', ');
    }
    return `Not logging at the moment`;
}

export async function convertSettingToName(setting: string): Promise<string> {
    switch (setting) {
        case 'streamPingRandomUser':
            return 'Random user stream pings';
        case 'logBlacklistedChannels':
            return 'Blacklist channel from logging';
        case 'logDeletedMessagesChannels':
            return 'Log deleted messages';
        case 'logEditedMessagesChannels':
            return 'Log edited messages';
        case 'logVoiceStateChannels':
            return 'Log voice status changes';
        default:
            throw new Error('Invalid setting.');
    }
}

export async function getCurrentChannels(setting: string, guildId: string): Promise<string[]> {
    const guild = await prisma.guild.findUnique({ where: { guildId } });
    if (!guild) return [];

    switch (setting) {
        case 'logBlacklistedChannels':
            return guild.logBlacklistedChannels;
        case 'logDeletedMessagesChannels':
            return guild.logDeletedMessagesChannels;
        case 'logEditedMessagesChannels':
            return guild.logEditedMessagesChannels;
        case 'logVoiceStateChannels':
            return guild.logVoiceStateChannels;
        default:
            return [];
    }
}

async function upsertStringSetting(guildId: string, setting: keyof Guild, value: string | null) {
    return await prisma.guild.upsert({
        where: { guildId: guildId },
        create: { guildId: guildId },
        update: { [setting]: value },
    });
}
