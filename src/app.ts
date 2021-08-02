import Discord, { Channel, MessageEmbed } from 'discord.js'
const client = new Discord.Client();

import { prefix, discordToken, twitchClientID } from './config.json'
import AddStream from './commands/AddStream'
import state from './util/CheckState'
import listStreams from './commands/ListStreams'
import deleteStream from './commands/DeleteStream';

console.log('Chizuru bot is starting...')

// Log to console when bot is started
client.once('ready', () => {
    console.log('Chizuru Bot is running!')
    state.initState();
});

setInterval(state.checkState, 1000 * 60),

client.on('message', async message => {
    // If not in channel with channel ID, disregard
    //if (message.channel.id !== channelID) return;
    
    // Split string string into array after prefix
    let args = message.content.substring(prefix.length).split(" ")
  
    // Skip strings without prefix & skip messages from bot.
    if(!message.content.startsWith(prefix)) return;
    if(!message.author.client) return;

    switch(args[0].toLowerCase()){
        case 'ping':
            message.channel.send('pong')
            break;
        case 'liststreams':
            let listMsg: MessageEmbed = await listStreams(message.channel)
            message.channel.send(listMsg)
            break;
        case 'addstream':
            let addMsg: MessageEmbed = await AddStream(args[1].toLowerCase(), message.channel.id)
            message.channel.send(addMsg)
            break;
        case 'deletestream':
            let delMsg: MessageEmbed = await deleteStream(args[1], message.channel.id, message.member.user.tag)
            message.channel.send(delMsg)
            break;
        default:
            break;
    }
})

// Export client so messages can be sent without passing around client
export { client }

// Must be the last line
client.login(discordToken);