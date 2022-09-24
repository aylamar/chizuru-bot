import { AnimeEntry, MangaEntry, MediaSearchEntry } from 'anilist-node';
import { CommandInteraction, TextChannel } from 'discord.js';
import { generateEmbed, replyMessage } from './messages';

export async function generateAnilistEmbed(entry: AnimeEntry | MangaEntry, type: string, color: number) {
    let genre = entry.genres.join(', ');
    let title: string;
    if (entry.title.english == null) {
        title = `${entry.title.romaji}`;
    } else {
        title = `${entry.title.english}`;
    }
    let date = new Date(entry.startDate.year, entry.startDate.month, entry.startDate.day).toString();

    let descRaw = entry.description.replace(/<br>/g, '').replace(/\n/g, ' ');
    let descArr = descRaw.split(' ');
    let desc: string;
    if (descArr.length > 30) {
        desc = `${descArr.splice(0, 30).join(' ')}... [(more)](${entry.siteUrl})`;
    } else {
        desc = descArr.join(' ');
    }

    return await generateEmbed({
        title: `${title}`,
        titleUrl: `${entry.siteUrl}`,
        msg: `**_${genre}_**\n${desc}`,
        image: `https://img.anili.st/media/${entry.id}`,
        color: color,
        timestamp: date,
        footer: `${type}`,
        footerIcon: 'https://anilist.co/img/icons/android-chrome-512x512.png',
    });
}

export async function anilistExists(
    res: MediaSearchEntry | null,
    parsedRes: AnimeEntry | MangaEntry | null,
    type: string,
    series: string,
    interaction: CommandInteraction
): Promise<boolean> {
    if (!res || res.pageInfo.total === 0 || parsedRes == null) {
        await replyMessage(interaction, `No ${type} results found for ${series}, try searching for something else.`);
        return false;
    }
    return true;
}

export async function anilistIsAdult(isAdult: boolean, interaction: CommandInteraction): Promise<boolean> {
    if (isAdult && interaction.inGuild()) {
        const channel = interaction.channel as TextChannel;
        if (!channel.nsfw) {
            await replyMessage(
                interaction,
                `This manga is marked as NSFW, and this channel is not marked as NSFW.`,
                true
            );
            return true;
        }
    }
    return false;
}
