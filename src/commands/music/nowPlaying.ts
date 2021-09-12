import { embedError, embedPurple, embedSuccess } from '../../util/Colors'
import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { AudioPlayerStatus } from '@discordjs/voice'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let queue = client.music.getQueue(interaction.guild)

    if (queue) {
        const song = queue.songs[0]
        let embed = new MessageEmbed()
            .setDescription(`(${song.name})[${song.url}] requested by ${song.user}`)
            .setColor(embedPurple)
        interaction.reply({ embeds: [embed] })
    } else {
        let embed = new MessageEmbed()
            .setDescription('Nothing is currently playing in this server.')
            .setColor(embedError)
        await interaction.reply({ embeds: [embed] })
    }
}

export const name: string = 'nowplaying'
export const description: string = 'Show what song is currently playing'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']