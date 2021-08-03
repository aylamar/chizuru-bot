import Discord from 'discord.js'
import ChannelMgr from '../util/ChannelMgr'

async function addStream(streamer: string, channelID: string) {
    console.log(await ChannelMgr.addStream(streamer, channelID))
    let res = await ChannelMgr.addStream(streamer, channelID)
    switch(res) {
        case 'Already Exists':
            let alreadyExistEmbed = new Discord.MessageEmbed()
                .setDescription(`You already get notifications for **${streamer}** here.`)
                .setColor(3066993)
            return alreadyExistEmbed
        case 'Success':
            let successEmbed = new Discord.MessageEmbed()
                .setDescription(`You'll be notified when **${streamer}** goes online.`)
                .setColor(3066993)
            return successEmbed
        case 'Unable to locate':
            let unableEmbed = new Discord.MessageEmbed()
                .setDescription(`Unable to locate **${streamer}** for some reason, is this the right channel name?`)
                .setColor(15158332)
            return unableEmbed
    }
}

export default addStream