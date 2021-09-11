import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { embedError } from '../../util/Colors'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let queue = client.music.getQueue(interaction.guild)

    if (queue) {
        const songList = queue.songs.slice(0, 10)
            .map((song, index) => `${index + 1}. ${song.name} - ${song.member.user.tag}`)
            .join('\n')

        interaction.reply(`\`\`\`${songList}\`\`\``)
    } else {
        let embed = new MessageEmbed()
            .setDescription('Nothing is currently playing in this server.')
            .setColor(embedError)
        await interaction.reply({ embeds: [embed] })
    }
}

export const name: string = 'queue'
export const description: string = 'See the music queue'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
