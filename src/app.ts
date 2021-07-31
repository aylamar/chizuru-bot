import Discord from 'discord.js'
const client = new Discord.Client();

import { prefix, discordToken, twitchClientID, twitchClientSecret } from './config.json';
import fetch from 'node-fetch'
import fs from 'fs'

console.log('starting')

// Log to console when bot is started
client.once('ready', () => {
    console.log('Chizuru Bot is running!');
});

client.on('message', async message => {
    //if not in channel with channel ID, disregard
    //if (message.channel.id !== channelID) return;
    
    //split string string into array after prefix
    let args = message.content.substring(prefix.length).split(" ");
  
    //skip strings without prefix & skip messages from bot.
    if(!message.content.startsWith(prefix)) return;
    if(!message.author.client) return;

    switch(args[0]){
        case 'ping':
            message.channel.send('pong');
            break;
        case 'embed':
            var data = await getChannel();
            const embed = new Discord.MessageEmbed()
                .setAuthor(data.title, '', `https://twitch.tv/${data.user_login}`)
                .setTitle(data.user_name)
                .setColor(0xff0000)
                .setDescription(`https://twitch.tv/${data.user_login}`)
                .setURL(`https://twitch.tv/${data.user_login}`)
                .addFields(
                    { name: 'Status', value: ':green_circle: Online', inline: true },
                    { name: 'Streaming', value: data.game_name, inline: true },
                )            
                .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${data.user_login}-620x360.jpg`)
                //.setImage('')
                .setTimestamp()
            await message.channel.send(embed)
            break;
        case 'getToken':
            getToken();
            break;
        default:
            break;
    
    }

})

async function getChannel() {
    var token = await getToken()
    let res: any = await fetch('https://api.twitch.tv/helix/streams?user_login=MOONMOON', {
        method: 'GET',
        headers: { 'client-id': twitchClientID, 'Authorization': `Bearer ${token}` }
    }) 
    let resParsed: any = await res.json()
    let data: any = resParsed.data
    console.log(data)
    return data[0]
}

// Fetch & return Twitch token
async function getToken() {
    let rawdata: any = fs.readFileSync('./tokens.json')
    let data = await JSON.parse(rawdata)
    
    if (data.expire_time <= Date.now()) {
        console.log('Fetching new token...')
        var res: any = await fetch(`https://id.twitch.tv/oauth2/token?&client_id=${twitchClientID}&client_secret=${twitchClientSecret}&grant_type=client_credentials`, { method: 'POST' })
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

//must be the last line:
client.login(discordToken);