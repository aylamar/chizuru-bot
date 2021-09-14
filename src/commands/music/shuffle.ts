import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let queue = client.music.getQueue(interaction.guild)

    if(queue) {
        queue.shuffle()
        let embed = new MessageEmbed()
            .setDescription('The queue has been shuffled.')
            .setColor(client.colors.success)
        await interaction.reply({ embeds: [embed] })

    } else {
        let embed = new MessageEmbed()
            .setDescription('Nothing is currently playing in this server.')
            .setColor(client.colors.error)
        await interaction.reply({ embeds: [embed] })
    }
}

export const name: string = 'shuffle'
export const description: string = 'Shuffles the current queue'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
