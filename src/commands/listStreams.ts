import Discord, { Interaction } from 'discord.js'
import ChannelMgr from '../util/ChannelMgr'

async function listStreams(interaction: Interaction) {
    if (!interaction.isCommand()) return
    let res = await ChannelMgr.getChannelByGuild(interaction.guildId)

    const embed = new Discord.MessageEmbed()
        .setTitle("Streams followed on this server:")
        .setColor(10181046)

    await res.map((e: any) => {
        e.followed_channels.map((f: any) => {
            embed.addFields({name: `${f}`, value: `<#${e._id}>`, inline: true})
        })
    })

    try {
        interaction.reply({embeds: [embed]})
    } catch (err) {
        console.error(`Error sending list streams response in ${interaction.channelId}\n${err}`)
    }
}

export default listStreams