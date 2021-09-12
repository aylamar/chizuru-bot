import { embedError, embedSuccess } from '../../util/Colors'
import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let queue = client.music.getQueue(interaction.guild)

    if (queue) {
        if (queue.repeatMode === 0) {
            queue.repeatMode = 2
            let embed = new MessageEmbed()
                .setDescription('Repeating the current queue.')
                .setColor(embedSuccess)
            interaction.reply({ embeds: [embed] })
        } else {
            queue.repeatMode = 0
            let embed = new MessageEmbed()
                .setDescription(`No longer repeating the queue.`)
                .setColor(embedSuccess)
            interaction.reply({ embeds: [embed] })
        }
    } else {
        let embed = new MessageEmbed()
            .setDescription('Nothing is currently playing in this server.')
            .setColor(embedError)
        await interaction.reply({ embeds: [embed] })
    }
}

export const name: string = 'loop'
export const description: string = 'Loop the current queue'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
