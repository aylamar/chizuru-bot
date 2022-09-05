import { Queue } from 'discord-music-player';
import {
    PermissionFlagsBits,
    PermissionsString,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { RunCommand } from '../../interfaces';
import { generateEmbed, replyEmbed, replyMessage } from '../../utils';

export const run: RunCommand = async (client, interaction) => {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.member.voice.channelId) {
        return await replyMessage(interaction, 'You must be in a voice channel to use this command.', true);
    }
    let queue: Queue | undefined = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.nowPlaying) return await replyMessage(interaction, 'Nothing is currently queued, why not queue something with /play?', true);

    let currentSong = queue.nowPlaying;
    let skip = queue.skip();
    let embed = generateEmbed({
        author: interaction.user.tag,
        authorIcon: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
        msg: `${ currentSong.name } has been skipped by ${ interaction.user.tag }.`,
        color: client.colors.success,
    });

    await skip;
    await replyEmbed(interaction, await embed);
};

export const name: string = 'skip';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages'];

export const data: SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel | PermissionFlagsBits.Speak)
    .setDMPermission(false);
