import fetch from 'node-fetch'
import { twitchClientID } from '../config.json'
import Discord from 'discord.js'
import TwitchToken from './TwitchToken'

async function getChannelStatus(channel_name: string, token?: string) {
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

    if (typeof token == 'undefined') {
        var token: string = await TwitchToken()
    }

    // Call Twitch API to get status of stream
    let res: any = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channel_name}`, {
        method: 'GET',
        headers: { 'client-id': twitchClientID, 'Authorization': `Bearer ${token}` }
    }) 
    let resParsed: any = await res.json()
    let data: any /*IsChannel*/ = resParsed.data

    if (data.length === 0) {
        const offlineEmbed = new Discord.MessageEmbed()
            .setTitle(`${channel_name} has gone offline`)
            .setColor(15158332)
            .setTimestamp()
        return offlineEmbed
    } else {
        const liveEmbed = new Discord.MessageEmbed()
            .setAuthor(data[0].title, '', `https://twitch.tv/${data[0].user_login}`)
            .setTitle(data[0].user_name)
            .setColor(3066993)
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
        return liveEmbed;
    }
}

export default getChannelStatus