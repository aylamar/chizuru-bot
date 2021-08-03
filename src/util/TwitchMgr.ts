import fs from 'fs'
import fetch from 'node-fetch'
import { twitchClientID, twitchClientSecret } from '../config.json'

const TwitchMgr: any = {}

TwitchMgr.getToken = async function() {
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
            data.expire_time = (data.expires_in * 999) + Date.now()
            fs.writeFileSync('./token.json', JSON.stringify(data))
            return data.access_token
        } else {
            //console.log('Token still valid, not fetching token.')
            return data.access_token
        }
    } catch {
        var res: any = await fetch(`https://id.twitch.tv/oauth2/token?&client_id=${twitchClientID}&client_secret=${twitchClientSecret}&grant_type=client_credentials`, { method: 'POST' })
        let data = await res.json()
        data.expire_time = (data.expires_in * 999) + Date.now()
        fs.writeFileSync('./token.json', JSON.stringify(data))
        return data.access_token
    }
}

TwitchMgr.getChannelStatus = async function (channel_name: string, token?: string) {
    if (typeof token == 'undefined') {
        var token: string = await TwitchMgr.getToken()
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

TwitchMgr.getProfile = async function (channel_name: string, token?: string) {
    if (typeof token == 'undefined') {
        var token: string = await TwitchMgr.getToken()
    }

    try {
        let res: any = await fetch(`https://api.twitch.tv/helix/search/channels?query=${channel_name}`, {
            method: 'GET',
            headers: { 'client-id': twitchClientID, 'Authorization': `Bearer ${token}` }
        })

        let parsedRes: any = await res.json()
        let data = await parsedRes.data.filter((e: any) => e['broadcaster_login'] === channel_name)

        if (data[0].broadcaster_login == channel_name) {
            // returns id, display_name, thumbnail_irl (profile picture), is_live (true/false)
            return data[0]
        } else {
            return 'Unable to locate'
        }
    } catch {
        console.log(`Error, something went wrong locating ${channel_name}'s profile`)
        return 'Unable to locate'
    }
}

TwitchMgr.checkStream = async function (channel_name: string, token?: string) {
    if (typeof token == 'undefined') {
        var token: string = await TwitchMgr.getToken()
    }

    try {
        let res: any = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channel_name}`, {
            method: 'GET',
            headers: { 'client-id': twitchClientID, 'Authorization': `Bearer ${token}` }
        })
        let parsedRes: any = await res.json()
        return parsedRes.data[0]
    } catch {
        console.log(`Error, something went wrong checking on ${channel_name}`)
    }

}

export default TwitchMgr