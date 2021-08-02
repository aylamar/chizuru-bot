import fs from 'fs'
import fetch from 'node-fetch'
import { twitchClientID, twitchClientSecret } from '../config.json'

// Fetch & return Twitch token
async function getTwitchToken() {
    interface IsToken {
        access_token: string
        expire_time: number
        expires_in: number
        token_type: string
    }

    try {
        let rawdata: any = fs.readFileSync('./token.json')
        let data: IsToken = await JSON.parse(rawdata)
        
        if (data.expire_time <= Date.now()) {
            console.log('Fetching new token...')
            var res: any = await fetch(`https://id.twitch.tv/oauth2/token?&client_id=${twitchClientID}&client_secret=${twitchClientSecret}&grant_type=client_credentials`, { method: 'POST' })
            res = await res.json()
            data["access_token"] = res.access_token

            // Read data from "tokens.json", parse, then save
            data.expire_time = data.expires_in + Date.now()
            fs.writeFileSync('./token.json', JSON.stringify(data))
            return data.access_token
        } else {
            //console.log('Token still valid, not fetching token.')
            return data.access_token
        }
    } catch {
        var res: any = await fetch(`https://id.twitch.tv/oauth2/token?&client_id=${twitchClientID}&client_secret=${twitchClientSecret}&grant_type=client_credentials`, { method: 'POST' })
        let data = await res.json()
        data.expire_time = data.expires_in + Date.now()
        fs.writeFileSync('./token.json', JSON.stringify(data))
    }
}

export default getTwitchToken