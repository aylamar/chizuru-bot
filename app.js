// @TODO
// Generate configuration if no configuration files

// Import dependencies
const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require("node-fetch");

// Import configuration file with API key and twitch channels
const { prefix, discordToken, channelID, twitchClientID, twitchClientSecret } = require('./config.json');

// @TODO
// Begin checking streams every minute based on channels

// @TODO
// Compare results between streams, if status changed post to 

client.once('ready', () => {
  console.log('Bot is ready!');
//  client.channels.cache.get(channelID).send('Ready for bearding.');
});

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
}});

//must be the last line:
client.login(discordToken);