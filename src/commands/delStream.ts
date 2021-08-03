import Discord from 'discord.js'
import ChannelMgr from '../util/ChannelMgr'

async function delStream(streamer: string, channelID: string) {
    let res = await ChannelMgr.delStream(streamer, channelID)
    switch(res) {
        case "Doesn't Exist":
            let alreadyExistEmbed = new Discord.MessageEmbed()
                .setDescription(`You won't recieve any notifications for **${streamer}**.`)
                .setColor(15158332)
            return alreadyExistEmbed
        case 'Success':
            let successEmbed = new Discord.MessageEmbed()
                .setDescription(`You'll no longer be notified when **${streamer}** goes online.`)
                .setColor(15158332)
            return successEmbed
    }
}

export default delStream