// @TODO
// Generate configuration if no configuration files

// Import dependencies
const Discord = require('discord.js');
const client = new Discord.Client();

const fetch = require("node-fetch");
const fs = require('fs')

// Import configuration file with API key and twitch channels
const { prefix, discordToken, channelID, twitchClientID, twitchClientSecret, twitchRedirectURL } = require('./config.json');

// @TODO
// Begin checking streams every minute based on channels

// @TODO
// Compare results between streams, if status changed post to 

// Log to console when bot is started
client.once('ready', () => {
  console.log('Chizuru Bot is running!');
//  client.channels.cache.get(channelID).send('Ready for bearding.');
});

// Listen for commands, then do things on new command
client.on('message', message => {
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
        case 'fetch':
            getToken();
            break;
}});

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

//must be the last line:
client.login(discordToken);