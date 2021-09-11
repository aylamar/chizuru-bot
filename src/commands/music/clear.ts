import { embedError, embedSuccess } from '../../util/Colors'
import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let queue = client.music.getQueue(interaction.guild)

    if (queue) {
        client.music.stop(interaction.guild)
        let embed = new MessageEmbed()
            .setDescription(`The current queue has been cleared.`)
            .setColor(embedSuccess)
        interaction.reply({ embeds: [embed] })
    } else {
        let embed = new MessageEmbed()
            .setDescription('Nothing is currently playing in this server.')
            .setColor(embedError)
        await interaction.reply({ embeds: [embed] })
    }
}

export const name: string = 'clear'
export const description: string = 'Clears the current queue'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
