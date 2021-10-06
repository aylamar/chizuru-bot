import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import fetch from 'node-fetch'

export const run: RunFunction = async (client, interaction) => {
    let res = await fetch('https://api.kanye.rest')
    let parsed: any = await res.json()

    const embed = new MessageEmbed()
        .setAuthor('Kanye West', 'https://i.imgur.com/ywPk81X.jpeg','https://twitter.com/kanyewest/')
        .setColor(client.colors.success)
        .setDescription(`"${parsed.quote}"`)
    try {
        await interaction.reply({ embeds: [embed] })
    } catch (err) {
        client.logger.error(`Error sending help response in ${interaction.channelId}\n${err}`)
    }
}

export const name: string = 'kanye'
export const description: string = 'Need some words of wisdom from Kanye?'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
