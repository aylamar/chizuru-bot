import type { AnimeEntry, MediaSearchEntry } from 'anilist-node';
import anilist from 'anilist-node';
import { ApplicationCommandOptionType } from 'discord.js';
import { Chizuru } from '../../interfaces';
import { Command } from '../../structures/command';
import { anilistExists, anilistIsAdult, deferReply, generateAnilistEmbed, replyEmbed } from '../../utils';

const Anilist = new anilist();

export default new Command({
    name: 'anime',
    description: 'Search for an anime by title',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['SendMessages'],
    module: Chizuru.CommandModule.Global,
    options: [
        {
            name: 'title',
            description: 'The title of the anime to search for',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],

    execute: async (client, interaction) => {
        const defer = deferReply(interaction);

        let res: MediaSearchEntry | null;
        let parsedRes: AnimeEntry | null;
        const title: string = interaction.options.getString('title') as string;
        console.log(title);

        res = await Anilist.searchEntry.anime(title);
        try {
            parsedRes = await Anilist.media.anime(res.media[0].id);
        } catch (err) {
            parsedRes = null;
        }

        if (!(await anilistExists(res, parsedRes, 'anime', title, interaction))) return;
        const validRes = parsedRes as AnimeEntry;
        if (await anilistIsAdult(validRes.isAdult, interaction)) return;

        const embed = generateAnilistEmbed(validRes, 'anime', client.colors.anilist);
        await defer;
        return await replyEmbed(interaction, await embed);
    },
});
