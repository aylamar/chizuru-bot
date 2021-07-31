const fs = require('fs')

// Fetch & return Twitch token
async function getToken() {
    let rawdata = fs.readFileSync('./tokens.json')
    let data = await JSON.parse(rawdata)
    
    if (data.expire_time <= Date.now()) {
        console.log('Fetching new token...')
        var res = await fetch(`https://id.twitch.tv/oauth2/token?&client_id=${twitchClientID}&client_secret=${twitchClientSecret}&grant_type=client_credentials`, { method: 'POST' })
        res = await res.json()

        // Read data from "tokens.json", parse, then save
        data.expire_time = await data.expires_in + Date.now()
        fs.writeFileSync('./tokens.json', JSON.stringify(data))
        return data.access_token
    } else {
        console.log('Token still valid, not fetching token.')
        return data.access_token
    }
}

module.exports = getToken