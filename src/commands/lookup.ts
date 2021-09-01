import Discord, { Interaction } from 'discord.js'
import anilist from 'anilist-node'
const Anilist = new anilist()

async function lookup(interaction: Interaction) {
    if (!interaction.isCommand()) return

    try {
        let res = null;
        let parsedRes = null;
        let type = ''
        switch (interaction.options.data[0].value) {
            case 'anime':
                res = await Anilist.searchEntry.anime(interaction.options.data[1].value.toString())
                parsedRes = await Anilist.media.anime(res.media[0].id)
                type = 'Anime'
                break;
            case 'manga':
                res = await Anilist.searchEntry.manga(interaction.options.data[1].value.toString())
                parsedRes = await Anilist.media.manga(res.media[0].id)
                type = 'Manga'
                break;
        }

        let genre = parsedRes.genres.join(', ')
        let title = ''
        if (parsedRes.title.english == null) {
            title = `${parsedRes.title.romaji}`
        } else {
            title = `${parsedRes.title.english}`
        }
        let date = new Date(parsedRes.startDate.year, parsedRes.startDate.month, parsedRes.startDate.day, 0, 0, 0, 0)

        let descRaw = parsedRes.description.replace(/<br>/g, '').replace(/\n/g, ' ');
        let descArr = descRaw.split(' ')
        let desc = ''
        if (descArr.length > 30) {
            desc = `${descArr.splice(0, 30).join(' ')}... [(more)](${parsedRes.siteUrl})`
        } else {
            desc = descArr.join(' ')
        }

        let embed = new Discord.MessageEmbed()
            .setTitle(`${title}`)
            .setURL(parsedRes.siteUrl)
            .setDescription(`**_${genre}_**\n${desc}`)
            .setImage(`https://img.anili.st/media/${parsedRes.id}`)
            .setTimestamp(date)
            .setFooter(`${type}`, 'https://anilist.co/img/icons/android-chrome-512x512.png')

        interaction.reply({embeds: [embed]})
    } catch (err) {
        console.error(`Error sending stats response in ${interaction.channelId}\n${err}`)
    }
}

export default lookup