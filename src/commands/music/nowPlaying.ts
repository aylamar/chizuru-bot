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

    let nowPlaying = queue.nowPlaying;

    let embed = generateEmbed({
        author: interaction.user.tag,
        authorIcon: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
        msg: `${ nowPlaying.name } (${ queue.createProgressBar().times }) requested by ${ nowPlaying.requestedBy?.tag } is currently playing`,
        color: client.colors.success,
    });

    await replyEmbed(interaction, await embed);
};

export const name: string = 'nowplaying';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages'];

export const data: SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('View the currently playing song')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel | PermissionFlagsBits.Speak)
    .setDMPermission(false);

