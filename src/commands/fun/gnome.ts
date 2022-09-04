import { Queue } from 'discord-music-player';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { RunCommand } from '../../interfaces';
import { replyMessage } from '../../utils';

export const run: RunCommand = async (client, interaction) => {
    if (!interaction.inCachedGuild()) return false;
    let channel = interaction.options.getChannel('channel');
    if (!channel || !channel.isVoiceBased) return await replyMessage(interaction, 'Please provide a valid voice channel.', true);
    if (interaction.user.id !== process.env.LAMAR_ID) return await replyMessage(interaction, 'https://www.youtube.com/watch?v=6n3pFFPSlW4', true);


    let queue: Queue | undefined = client.player.getQueue(interaction.guildId);
    if (queue) return;
    queue = client.player.createQueue(interaction.guildId, { data: { channelId: channel.id } });

    await queue.join(channel.id);
    await queue.play('https://www.youtube.com/watch?v=6n3pFFPSlW4');

    await replyMessage(interaction, `<#${ channel.id }> has been gnomed`, true);
};

export const name: string = 'gnome';
export const data = new SlashCommandBuilder()
    .setName('gnome')
    .setDescription('Gnome a voice channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel)
    .setDMPermission(false)
    .addChannelOption(option => option.setName('channel')
        .setDescription('The channel to gnome')
        .setRequired(true));
