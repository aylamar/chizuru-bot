import fetch from 'node-fetch'
import TwitchToken from './TwitchToken'
import { twitchClientID } from '../config.json'


async function getChannelStatus() {
    interface IsChannel { 
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
    }

    var token: string = await TwitchToken()
    let res: any = await fetch('https://api.twitch.tv/helix/streams?user_login=MOONMOON', {
        method: 'GET',
        headers: { 'client-id': twitchClientID, 'Authorization': `Bearer ${token}` }
    }) 
    let resParsed: any = await res.json()
    let data: IsChannel = resParsed.data
    console.log(data)
    return data[0]
}

export default getChannelStatus