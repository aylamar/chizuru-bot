import Discord from 'discord.js'
import ChannelMgr from '../util/ChannelMgr'

async function listStreams(guild_id: string) {
    let res = await ChannelMgr.getChannelByGuild(guild_id)

    const embed = new Discord.MessageEmbed()
        .setTitle("Streams followed on this server:")
        .setColor(10181046)

    await res.map((e: any) => {
        e.followed_channels.map((f: any) => {
            embed.addFields({name: `${f}`, value: `<#${e._id}>`, inline: true})
        })
    })

    return embed
}

export default listStreams