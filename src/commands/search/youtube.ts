import { PermissionFlagsBits, PermissionsString, SlashCommandBuilder } from 'discord.js';
import ytSearch from 'yt-search';
import { RunCommand } from '../../interfaces';
import { replyMessage } from '../../utils';

export const run: RunCommand = async (client, interaction) => {
    let searchTitle = interaction.options.getString('title') as string;
    let video: ytSearch.VideoSearchResult | null;

    try {
        video = await videoSearch(searchTitle);
    } catch (err: any) {
        client.logger.error(err);
        video = null;
    }

    if (video) return await replyMessage(interaction, video.url);
    await replyMessage(interaction, `No results found for ${ searchTitle }, try searching for something else.`, true);
};

export const name: string = 'youtube';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages'];

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('Search for a video on YouTube by title')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel)
    .addStringOption(option => option.setName('title')
        .setDescription('The title of the video to search for')
        .setRequired(true))
    .setDMPermission(true);


async function videoSearch(query: string) {
    const video = await ytSearch(query);
    if (video.videos.length > 1) {
        return video.videos[0];
    } else {
        return null;
    }
}
