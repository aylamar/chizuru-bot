import Discord, { Channel } from 'discord.js'
const client = new Discord.Client();

import { prefix, discordToken, twitchClientID } from './config.json';
import TwitchToken from './util/TwitchToken'
import getChannelStatus from './util/GetChannelStatus'
import AddStream from './commands/AddStream'

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

    switch(args[0].toLowerCase()){
        case 'ping':
            message.channel.send('pong');
            break;
        case 'embed':
            let embed: any = await getChannelStatus(args[1]);
            await message.channel.send(embed)
            break;
        case 'manualsend':
            const channel = client.channels.resolve('295368291407364106')
            if (channel.isText()) {
                channel.send(`${channel.id} is a text based channel`)
            } else {
                console.log(`${channel.id} is not a text based channel`)
            }
            break;
        case 'gettoken':
            TwitchToken();
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
        default:
            break;
    
    }

})

//must be the last line:
client.login(discordToken);