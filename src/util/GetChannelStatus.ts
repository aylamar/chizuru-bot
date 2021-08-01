import fetch from 'node-fetch'
import { twitchClientID } from '../config.json'
import getTwitchToken from './GetTwitchToken'

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
        var token: string = await getTwitchToken()
    }

    // Call Twitch API to get status of stream
    let res: any = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channel_name}`, {
        method: 'GET',
        headers: { 'client-id': twitchClientID, 'Authorization': `Bearer ${token}` }
    }) 
    let resParsed: any = await res.json()
    let data: any /*IsChannel*/ = resParsed.data

    return data;
}

export default getChannelStatus