import Discord, { Channel, MessageEmbed } from 'discord.js'
const client = new Discord.Client();

import { prefix, discordToken, mongoURI } from './config.json'
import AddStream from './commands/addStream'
import listStreams from './commands/ListStreams'
import delStream from './commands/delStream'
import mongoose from "mongoose";
import StreamMgr from './util/StreamMgr'


console.log('Chizuru bot is starting...')

// Log to console when bot is started
client.once('ready', async () => {
    console.log('Chizuru Bot is running!')
});

client.on('message', async message => {
    // If not in channel with channel ID, disregard
    //if (message.channel.id !== channelID) return;
    
    // Split string string into array after prefix
    let args = message.content.substring(prefix.length).split(" ")
  
    // Skip strings without prefix & skip messages from bot.
    if (!message.content.startsWith(prefix)) return;
    if (!message.author.client) return;

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
            await message.channel.send(addMsg)
            break;
        case 'delstream':
            let delMsg: any = await delStream(args[1].toLowerCase(), message.channel.id, /*message.member.user.tag*/)
            message.channel.send(delMsg)
            break;
        default:
            break;
    }
})

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result: any) => {
        console.log('Connected with Mongoose')
        //StreamMgr.initState()
        setInterval(StreamMgr.updateState, 1000 * 60),

        // Must be the last line
        client.login(discordToken);
    })
    .catch((err: any) => console.error(err))

// Export client so messages can be sent without passing around client
export { client }
