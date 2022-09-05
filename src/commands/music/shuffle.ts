import { Queue } from 'discord-music-player';
import {
    PermissionFlagsBits,
    PermissionsString,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { RunCommand } from '../../interfaces';
import { generateEmbed, inVoiceChannel, replyEmbed, replyMessage } from '../../utils';

export const run: RunCommand = async (client, interaction) => {
    if (!interaction.inCachedGuild()) return false;
    if (!await inVoiceChannel(client, interaction)) return;
    let queue: Queue | undefined = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.nowPlaying) return await replyMessage(interaction, 'Nothing is currently queued, why not queue something with /play?', true);

    let shuffled = queue.shuffle();
    if (!shuffled) return await replyMessage(interaction, 'There are no songs to shuffle, queue more songs then try again', true);
    queue.songs = shuffled;

    let embed = generateEmbed({
        author: interaction.user.tag,
        authorIcon: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
        msg: `The queue has been shuffled by ${ interaction.user.tag }.`,
        color: client.colors.success,
    });

    await replyEmbed(interaction, await embed);
};

export const name: string = 'shuffle';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages'];

export const data: SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the queue')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel | PermissionFlagsBits.Speak)
    .setDMPermission(false);
