import Discord from 'discord.js'
import ChannelMgr from '../util/ChannelMgr'

async function listStreams(channel_id: string) {
    let streamList: string[] = []

    streamList = await ChannelMgr.getStreamersByChannel(channel_id)

    const embed = new Discord.MessageEmbed()
        .setTitle("Streams you're following:")
        .setColor(10181046)
        .setTimestamp()

    streamList.forEach(e => embed.addFields({name: `${e}`, value: `<#${channel_id}>`, inline: true}))

    return embed
}

export default listStreams