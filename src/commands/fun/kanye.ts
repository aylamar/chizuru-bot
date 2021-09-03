import { RunFunction } from '../../interfaces/Command'
import { MessageEmbed } from 'discord.js'
import fetch from 'node-fetch'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return

    let res = await fetch('https://api.kanye.rest')
    let parsed: any = await res.json()

    const embed = new MessageEmbed()
        .setAuthor('Kanye West', 'https://i.imgur.com/ywPk81X.jpeg','https://twitter.com/kanyewest/')
        .setDescription(`"${parsed.quote}"`)
    try {
        await interaction.reply({ embeds: [embed] })
    } catch (err) {
        client.logger.error(
            `Error sending help response in ${interaction.channelId}\n${err}`
        )
    }
}

export const name: string = 'kanye'
export const description: string = 'Need some words of wisdom from Kanye?'
