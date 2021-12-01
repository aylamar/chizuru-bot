import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    const musicChannel = client.cache[interaction.guildId].musicChannel
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        let queue = client.music.getQueue(interaction.guild)

        if (queue) {
            if (queue.repeatMode === 0) {
                queue.repeatMode = 2
                let embed = new MessageEmbed()
                    .setDescription('Repeating the current queue.')
                    .setColor(client.colors.success)
                await interaction.reply({ embeds: [embed] })
            } else {
                queue.repeatMode = 0
                let embed = new MessageEmbed()
                    .setDescription(`No longer repeating the queue.`)
                    .setColor(client.colors.success)
                await interaction.reply({ embeds: [embed] })
            }
        } else {
            let embed = new MessageEmbed()
                .setDescription('Nothing is currently playing in this server.')
                .setColor(client.colors.error)
            await interaction.reply({ embeds: [embed] })
        }
    } else {
        await interaction.reply({
            content: `This command can only be run in <#${musicChannel}>.`,
            ephemeral: true,
        })
    }
}

export const name: string = 'loop'
export const description: string = 'Loop the current queue'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
