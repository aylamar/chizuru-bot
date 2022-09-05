import { Queue } from 'discord-music-player';
import {
    PermissionFlagsBits,
    PermissionsString,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { RunCommand } from '../../interfaces';
import { generateEmbed, replyEmbed, replyMessage } from '../../utils';
import { musicValidator } from '../../utils/validators';

export const run: RunCommand = async (client, interaction) => {
    if (!interaction.inCachedGuild()) return false;
    if (!await musicValidator(client, interaction)) return;
    let queue: Queue | undefined = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.nowPlaying) return await replyMessage(interaction, 'Nothing is currently queued, why not queue something with /play?', true);

    queue.setPaused(false);
    let embed = generateEmbed({
        author: interaction.user.tag,
        authorIcon: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
        msg: `The queue has been resumed by ${ interaction.user.tag }.`,
        color: client.colors.success,
    });

    await replyEmbed(interaction, await embed);
};

export const name: string = 'resume';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages'];

export const data: SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the queue')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel | PermissionFlagsBits.Speak)
    .setDMPermission(false);
