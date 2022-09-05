import {
    EmbedBuilder,
    PermissionFlagsBits,
    PermissionsString,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { RunCommand } from '../../interfaces';
import { deferReply, generateEmbed, replyEmbed } from '../../utils';
import { handleBlacklist, handleCreate, handleDelete } from './subCommand';

export const run: RunCommand = async (client, interaction) => {
    // ensure the interaction is in a guild
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
};

export const name: string = 'starboard';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages', 'ViewAuditLog'];
export const data: SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Update and settings a starboard on the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand => subcommand.setName('create')
            .setDescription('Create a starboard on the server')
            .addChannelOption(option => option.setName('channel')
                .setDescription('The channel to create the starboard in')
                .setRequired(true))
            .addStringOption(option => option.setName('emote')
                .setDescription('The emote to use for the starboard')
                .setRequired(true))
            .addIntegerOption(option => option.setName('count')
                .setDescription('The amount of reactions needed to post to the starboard')
                .setRequired(true)),
        // .addIntegerOption(option => option.setName('timeout')
        //     .setDescription('The maximum age in hours a new message can be to be posted to the starboard')
        //     .setRequired(true))
    )
    .addSubcommand(subcommand => subcommand.setName('delete')
        .setDescription('Delete a starboard on the server')
        .addChannelOption(option => option.setName('channel')
            .setDescription('The channel that contains the starboard to delete')
            .setRequired(true)),
    )
    .addSubcommandGroup(group => group.setName('blacklist')
        .setDescription('Blacklist a channel or user from being posted to the starboard')
        .addSubcommand(subcommand => subcommand.setName('channel')
            .setDescription('Blacklist a channel from being posted to the starboard')
            .addChannelOption(option => option.setName('channel')
                .setDescription('The channel of the starboard to blacklist the channel from')
                .setRequired(true))
            .addChannelOption(option => option.setName('blacklist-channel')
                .setDescription('The channel to blacklist from the starboard')
                .setRequired(true))
            .addBooleanOption(option => option.setName('blacklisted')
                .setDescription('Whether or not the channel should be blacklisted')
                .setRequired(true)),
        )
        .addSubcommand(subcommand => subcommand.setName('user')
            .setDescription('Blacklist a user from being posted to the starboard')
            .addChannelOption(option => option.setName('channel')
                .setDescription('The channel of the starboard to blacklist the channel from')
                .setRequired(true))
            .addUserOption(option => option.setName('user')
                .setDescription('The user to blacklist from the starboard')
                .setRequired(true))
            .addBooleanOption(option => option.setName('blacklisted')
                .setDescription('Whether or not the user should be blacklisted')
                .setRequired(true)),
        ),
    );
