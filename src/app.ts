import Discord, { Channel, MessageEmbed } from 'discord.js'
const client = new Discord.Client();

import { prefix, discordToken, twitchClientID } from './config.json'
import getTwitchToken from './util/GetTwitchToken'
import getChannelStatus from './util/GetChannelStatus'
import AddStream from './commands/AddStream'
import generateEmbed from './util/GenerateEmbed'
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
    //if not in channel with channel ID, disregard
    //if (message.channel.id !== channelID) return;
    
    //split string string into array after prefix
    let args = message.content.substring(prefix.length).split(" ")
  
    //skip strings without prefix & skip messages from bot.
    if(!message.content.startsWith(prefix)) return;
    if(!message.author.client) return;

    switch(args[0].toLowerCase()){
        case 'ping':
            message.channel.send('pong')
            break;
        case 'embed':
            let data = await getChannelStatus(args[1])
            let embed = await generateEmbed(data, args[1])
            await message.channel.send(embed)
            break;
        case 'liststreams':
            listStreams(message.channel)
        case 'gettoken':
            getTwitchToken()
            break;
        case 'addstream':
            let val: boolean = await AddStream(args[1].toLowerCase(), message.channel.id)
            let msg: string = ""
            if(val === true) {
                msg = `${args[1]} is now being tracked in this channel`
            } else {
                msg = `Either this streamer is already being tracked or you broke something`
            }
            message.channel.send(msg)
            break;
        case 'deletestream':
            let delMsg: MessageEmbed = await deleteStream(args[1], message.channel.id)
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