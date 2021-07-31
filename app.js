// @TODO
// Generate configuration if no configuration files

// Import dependencies
const Discord = require('discord.js');
const client = new Discord.Client();

const fetch = require("node-fetch");
const getToken = require('./util/TwitchAuth')

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
}});

async function getChannel() {
    var token = await getToken()
    var res = await fetch('https://api.twitch.tv/helix/streams?user_login=MOONMOON', {
        method: 'GET',
        headers: { 'client-id': twitchClientID, 'Authorization': `Bearer ${token}` }
    }) 
    res = await res.json()
    console.log(res.data)
    return res.data[0]
}

//must be the last line:
client.login(discordToken);