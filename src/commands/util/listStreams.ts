import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import ChannelMgr from '../../util/ChannelMgr'
import consola from 'consola'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let res = await ChannelMgr.getChannelByGuild(interaction.guildId)

    const embed = new MessageEmbed()
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
        consola.error(err)
    }
}

export const name: string = 'liststreams'
export const description: string = 'Lists all streams followed in this server'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
