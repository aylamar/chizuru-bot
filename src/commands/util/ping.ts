import { PermissionFlagsBits, PermissionsString, SlashCommandBuilder } from 'discord.js';
import { RunCommand } from '../../interfaces';
import { replyMessage } from '../../utils';

export const run: RunCommand = async (client, interaction) => {
    let curTime = Date.now();
    let ping = curTime - interaction.createdTimestamp;

    let msg = `:ping_pong: ~${ ping }ms delay between when you ran the command and when I received it.`;
    return await replyMessage(interaction, msg);
};

export const name: string = 'ping';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages'];

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel)
    .setDMPermission(false);
