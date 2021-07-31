import fetch from 'node-fetch'
import TwitchToken from './TwitchToken'
import { twitchClientID } from '../config.json'
import Discord from 'discord.js'

async function getChannelStatus(channel_name: string) {
    /*interface IsChannel { 
        [index: number]: {
            game_id: string
            game_name: string
            id: string
            is_mature: Boolean
            language: string
            started_at:string
            tag_ids: Array<string>
            thumbnail_url: string
            title: string
            type: string
            user_id: string
            user_login: string
            user_name: string
            viewer_count: number
        }
    }*/

    var token: string = await TwitchToken()
    let res: any = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channel_name}`, {
        method: 'GET',
        headers: { 'client-id': twitchClientID, 'Authorization': `Bearer ${token}` }
    }) 
    let resParsed: any = await res.json()
    let data: any /*IsChannel*/ = resParsed.data

    if (data.length === 0) {
        var msg: string = `${channel_name} is not live at the moment.`
        return msg
    } else {
        const embed = new Discord.MessageEmbed()
            .setAuthor(data[0].title, '', `https://twitch.tv/${data[0].user_login}`)
            .setTitle(data[0].user_name)
            .setColor(0xff0000)
            .setDescription(`https://twitch.tv/${data[0].user_login}`)
            .setURL(`https://twitch.tv/${data[0].user_login}`)
            .addFields(
                { name: 'Status', value: ':green_circle: Online', inline: true },
                { name: 'Viewers', value: data[0].viewer_count, inline: true },
                { name: 'Streaming', value: data[0].game_name, inline: true },
            )            
            .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${data[0].user_login}-620x360.jpg`)
            //.setImage('') // used for setting avatar
            .setTimestamp()
        return embed;
    }
}

export default getChannelStatus