import Discord from 'discord.js'
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
            var data = await getChannelStatus();
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