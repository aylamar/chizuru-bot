import type { AnimeEntry, MangaEntry, MediaSearchEntry } from 'anilist-node';
import anilist from 'anilist-node';
import { PermissionFlagsBits, PermissionsString, SlashCommandBuilder, TextChannel } from 'discord.js';
import { RunCommand } from '../../interfaces';
import { deferReply, generateEmbed, replyEmbed, replyMessage } from '../../utils';

const Anilist = new anilist();

export const run: RunCommand = async (client, interaction) => {
    await deferReply(interaction);

    let res: MediaSearchEntry | null = null;
    let parsedRes: AnimeEntry | MangaEntry | null = null;
    const type: string = interaction.options.getString('type') as string;
    const series: string = interaction.options.getString('series') as string;

    switch (type) {
        case 'anime':
            res = await Anilist.searchEntry.anime(series);
            if (res.pageInfo.total === 0) break;
            parsedRes = await Anilist.media.anime(res.media[0].id);
            break;
        case 'manga':
            res = await Anilist.searchEntry.manga(series);
            if (res.pageInfo.total === 0) break;
            parsedRes = await Anilist.media.manga(res.media[0].id);
            break;
        default:
            throw new Error('Invalid media type');
    }

    if (res.pageInfo.total === 0 || parsedRes == null) {
        await replyMessage(interaction, `No results found for ${ series } (${ type }), try searching for something else.`, true);
        return;
    }

    // if parsedRes.isAdult is true and command was executed in a guild, check to see if channel is NSFW
    if (parsedRes.isAdult && interaction.inGuild()) {
        const channel = interaction.channel as TextChannel;
        if (!channel.nsfw) {
            await replyMessage(interaction, `This ${ type } is marked as NSFW, and this channel is not NSFW.`, true);
            return;
        }
    }

    let genre = parsedRes.genres.join(', ');
    let title: string;
    if (parsedRes.title.english == null) {
        title = `${ parsedRes.title.romaji }`;
    } else {
        title = `${ parsedRes.title.english }`;
    }
    let date = new Date(parsedRes.startDate.year, parsedRes.startDate.month, parsedRes.startDate.day, 0, 0, 0, 0).toString();

    let descRaw = parsedRes.description.replace(/<br>/g, '').replace(/\n/g, ' ');
    let descArr = descRaw.split(' ');
    let desc: string;
    if (descArr.length > 30) {
        desc = `${ descArr.splice(0, 30).join(' ') }... [(more)](${ parsedRes.siteUrl })`;
    } else {
        desc = descArr.join(' ');
    }

    const embed = await generateEmbed({
        title: `${ title }`,
        titleUrl: `${ parsedRes.siteUrl }`,
        msg: `**_${ genre }_**\n${ desc }`,
        image: `https://img.anili.st/media/${ parsedRes.id }`,
        color: client.colors.anilist,
        timestamp: date,
        footer: `${ type }`,
        footerIcon: 'https://anilist.co/img/icons/android-chrome-512x512.png',
    });
    return await replyEmbed(interaction, embed);
};

export const name: string = 'lookup';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages'];

export const data = new SlashCommandBuilder()
    .setName('lookup')
    .setDescription('Search for a media entry on Anilist')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel)
    .setDMPermission(true)
    .addStringOption(option => option.setName('type')
        .setDescription('The title of the video to search for')
        .addChoices({ name: 'Anime', value: 'anime' }, { name: 'Manga', value: 'manga' })
        .setRequired(true))
    .addStringOption(option => option.setName('series')
        .setDescription('The name of the anime or series to search for')
        .setRequired(true));
