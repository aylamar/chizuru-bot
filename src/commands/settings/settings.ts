import {
    EmbedBuilder,
    PermissionFlagsBits,
    PermissionsString,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import type { RunCommand } from '../../interfaces';
import { deferReply, generateEmbed, replyEmbed } from '../../utils';
import { handleList, handleLog, handlePing, handleUpdate } from './subCommand';

export const run: RunCommand = async (client, interaction) => {
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
        case 'update':
            embed = handleUpdate(setting, enabled, interaction.guildId, client);
            break;
        case 'stream-ping':
            const role = interaction.options.getRole('role');
            embed = handlePing(setting, enabled, role, interaction.guildId, client);
            break;
        case 'log':
            embed = handleLog(setting, enabled, channel, client);
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
};

export const name: string = 'settings';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages', 'ViewAuditLog'];
export const data: SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Update and view settings for the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand => subcommand.setName('list')
        .setDescription('List the current settings for the server'))
    .addSubcommand(subcommand => subcommand.setName('update')
        .setDescription('Update a setting on the server')
        .addStringOption(option => option.setName('setting')
            .setDescription('The setting to update')
            .setRequired(true)
            .addChoices(
                { name: 'Random user stream pings', value: 'streamPingRandomUser' },
            ))
        .addBooleanOption(option => option.setName('enabled')
            .setDescription('True to enable the setting, false to disable it.')
            .setRequired(true)))
    .addSubcommand(subcommand => subcommand.setName('stream-ping')
        .setDescription('Group to ping when a new stream goes live')
        .addBooleanOption(option => option.setName('enabled')
            .setDescription('True to enable the setting, false to disable it')
            .setRequired(true))
        .addRoleOption(option => option.setName('role')
            .setDescription('The role to ping')
            .setRequired(false)))
    .addSubcommand(subcommand => subcommand.setName('log')
        .setDescription('Enable or disable logging for a setting in a channel')
        .addStringOption(option => option.setName('setting')
            .setDescription('The setting to toggle')
            .setRequired(true)
            .addChoices(
                { name: 'Blacklist Channel From Logs', value: 'logBlacklistedChannels' },
                { name: 'Log Deleted Messages', value: 'logDeletedMessagesChannels' },
                { name: 'Log Edited Messages', value: 'logEditedMessagesChannels' },
                { name: 'Log Voice Status Changes', value: 'logVoiceStateChannels' },
            ))
        .addChannelOption(option => option.setName('channel')
            .setDescription('The channel to toggle the setting in')
            .setRequired(true))
        .addBooleanOption(option => option.setName('enabled')
            .setDescription('True to enable the setting, false to disable it')
            .setRequired(true)));
