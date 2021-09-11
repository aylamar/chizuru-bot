import { embedError, embedSuccess } from '../../util/Colors'
import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let queue = client.music.getQueue(interaction.guild)

    if(queue) {
        if (queue.songs[1]) {
            let embed = new MessageEmbed()
                .setDescription(`Skipping ${queue.songs[0].name}.`)
                .setColor(embedSuccess)
            await interaction.reply({ embeds: [embed] })
            await queue.skip()
        } else {
            let embed = new MessageEmbed()
                .setDescription(`Skipping ${queue.songs[0].name}.`)
                .setColor(embedSuccess)
            await interaction.reply({ embeds: [embed] })
            await queue.stop()
        }
    } else {
        let embed = new MessageEmbed()
            .setDescription('Nothing is currently playing in this server.')
            .setColor(embedError)
        await interaction.reply({ embeds: [embed] })
    }
}

export const name: string = 'skip'
export const description: string = 'Skips the current song'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL',]
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
