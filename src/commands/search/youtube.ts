import { ApplicationCommandOptionType } from 'discord.js';
import ytSearch from 'yt-search';
import { Command, CommandModule } from '../../classes/command';
import { replyMessage } from '../../utils';

export default new Command({
    name: 'youtube',
    description: 'Search for a video on YouTube by title',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['SendMessages'],
    module: CommandModule.Global,
    options: [{
        name: 'query',
        description: 'The title of the video to search for',
        type: ApplicationCommandOptionType.String,
        required: true,
    }],

    execute: async (client, interaction) => {
        let searchTitle = interaction.options.getString('title') as string;
        const video: ytSearch.VideoSearchResult | null = await videoSearch(searchTitle);

        if (video) return await replyMessage(interaction, video.url, false);
        await replyMessage(interaction, `No results found for ${ searchTitle }, try searching for something else.`, true);
    },
});

async function videoSearch(query: string) {
    try {
        const result = await ytSearch(query);
        return result.videos[0];
    } catch (err: any) {
        return null;
    }
}
