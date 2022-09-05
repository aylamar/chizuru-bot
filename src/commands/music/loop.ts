import { Queue, RepeatMode } from 'discord-music-player';
import { PermissionFlagsBits, PermissionsString, SlashCommandBuilder } from 'discord.js';
import { RunCommand } from '../../interfaces';
import { generateEmbed, replyEmbed, replyMessage } from '../../utils';
import { musicValidator } from '../../utils/validators';

export const run: RunCommand = async (client, interaction) => {
    if (!interaction.inCachedGuild()) return false;
    if (!await musicValidator(client, interaction)) return;
    let queue: Queue | undefined = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.nowPlaying) return await replyMessage(interaction, 'Nothing is currently queued, why not queue something with /play?', true);

    let mode = interaction.options.getString('mode', true);
    switch (mode) {
        case 'loop-song':
            queue.setRepeatMode(RepeatMode.SONG);
            break;
        case 'loop-queue':
            queue.setRepeatMode(RepeatMode.QUEUE);
            break;
        case 'disabled':
            queue.setRepeatMode(RepeatMode.DISABLED);
            break;
    }

    let embed = generateEmbed({
        author: interaction.user.tag,
        authorIcon: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
        msg: `Repeat mode has been set to ${ mode.replace('-', ' ') } by ${ interaction.user.tag }.`,
        color: client.colors.success,
    });

    await replyEmbed(interaction, await embed);
};

export const name: string = 'loop';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages'];

export const data = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Modify the loop setting for the queue')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel | PermissionFlagsBits.Speak)
    .setDMPermission(false)
    .addStringOption(option => option.setName('mode')
        .setDescription('The mode to set the loop to')
        .setRequired(true)
        .addChoices(
            { name: 'loop-song', value: 'loop-song' },
            { name: 'loop-queue', value: 'loop-queue' },
            { name: 'disabled', value: 'disabled' },
        ));
