import type { MangaEntry, MediaSearchEntry } from 'anilist-node';
import anilist from 'anilist-node';
import { ApplicationCommandOptionType } from 'discord.js';
import { Chizuru } from '../../interfaces';
import { Command } from '../../structures/command';
import { anilistExists, anilistIsAdult, deferReply, generateAnilistEmbed, replyEmbed } from '../../utils';

const Anilist = new anilist();

export default new Command({
    name: 'manga',
    description: 'Search for a manga by title',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['SendMessages'],
    module: Chizuru.CommandModule.Global,
    options: [
        {
            name: 'title',
            description: 'The title of the manga to search for',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],

    execute: async (client, interaction) => {
        const defer = deferReply(interaction);

        let res: MediaSearchEntry | null;
        let parsedRes: MangaEntry | null;
        const title: string = interaction.options.getString('title', true);

        res = await Anilist.searchEntry.manga(title);
        try {
            parsedRes = await Anilist.media.manga(res.media[0].id);
        } catch (err) {
            parsedRes = null;
        }

        if (!(await anilistExists(res, parsedRes, 'manga', title, interaction))) return;
        const validRes = parsedRes as MangaEntry;
        if (await anilistIsAdult(validRes.isAdult, interaction)) return;

        const embed = generateAnilistEmbed(validRes, 'manga', client.colors.anilist);
        await defer;
        return await replyEmbed(interaction, await embed);
    },
});
