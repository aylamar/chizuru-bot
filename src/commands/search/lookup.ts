import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import anilist, { AnimeEntry, MangaEntry, MediaSearchEntry } from 'anilist-node'

const Anilist = new anilist()

export const run: RunFunction = async (client, interaction) => {
    try {
        let res: MediaSearchEntry = null
        let parsedRes: AnimeEntry | MangaEntry = null
        let type = ''
        switch (interaction.options.data[0].value) {
            case 'anime':
                res = await Anilist.searchEntry.anime(interaction.options.data[1].value.toString())
                if(res.pageInfo.total === 0) break
                parsedRes = await Anilist.media.anime(res.media[0].id)
                type = 'Anime'
                break
            case 'manga':
                res = await Anilist.searchEntry.manga(interaction.options.data[1].value.toString())
                if(res.pageInfo.total === 0) break
                parsedRes = await Anilist.media.manga(res.media[0].id)
                type = 'Manga'
                break
        }

        if (res.pageInfo.total === 0) {
            interaction.reply({ content: 'Nothing found, try searching for something else.', ephemeral: true })
            return
        }
        
        if(parsedRes.isAdult && client.cache[interaction.guildId].lookupNSFW !== true) {
            interaction.reply({ content: 'Adult anime & manga is currently disabled on this server.', ephemeral: true })
            return
        } 

        let genre = parsedRes.genres.join(', ')
        let title = ''
        if (parsedRes.title.english == null) {
            title = `${parsedRes.title.romaji}`
        } else {
            title = `${parsedRes.title.english}`
        }
        let date = new Date(parsedRes.startDate.year, parsedRes.startDate.month, parsedRes.startDate.day, 0, 0, 0, 0)

        let descRaw = parsedRes.description.replace(/<br>/g, '').replace(/\n/g, ' ')
        let descArr = descRaw.split(' ')
        let desc = ''
        if (descArr.length > 30) {
            desc = `${descArr.splice(0, 30).join(' ')}... [(more)](${parsedRes.siteUrl})`
        } else {
            desc = descArr.join(' ')
        }

        let embed = new MessageEmbed()
            .setTitle(`${title}`)
            .setURL(parsedRes.siteUrl)
            .setDescription(`**_${genre}_**\n${desc}`)
            .setImage(`https://img.anili.st/media/${parsedRes.id}`)
            .setTimestamp(date)
            .setColor(client.colors.anilist)
            .setFooter(`${type}`, 'https://anilist.co/img/icons/android-chrome-512x512.png')
        interaction.reply({ embeds: [embed] })                

    } catch (err) {
        client.logger.error(err)
    }
}

export const name: string = 'lookup'
export const description: string = 'Look up information on an anime or manga?'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
export const options: Array<Object> = [
    {
        name: 'type',
        type: 3,
        description: 'Do you want to look up an anime or manga?',
        required: true,
        choices: [
            {
                name: 'anime',
                value: 'anime',
            },
            {
                name: 'manga',
                value: 'manga',
            },
        ],
    },
    {
        name: 'series',
        type: 3,
        required: true,
        description: 'The name of the anime or manga to lookup',
    },
]
