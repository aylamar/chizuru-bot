import Discord, { Channel } from 'discord.js'
import ChannelMgr from '../util/ChannelMgr'

async function listStreams(channel_id: Channel) {
    let streamList: string[] = []

    streamList = await ChannelMgr.getStreamersByChannel(channel_id.id)

    const embed = new Discord.MessageEmbed()
        .setTitle("Streams you're following:")
        .setColor(10181046)
        .setTimestamp()

    streamList.forEach(e => embed.addFields({name: `${e}`, value: `<#${channel_id.id}>`, inline: true}))

    return embed
}

export default listStreams