import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    const musicChannel = client.cache[interaction.guildId].musicChannel
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        let queue = client.music.getQueue(interaction.guild)

        if (queue) {
            if (!queue.paused) {
                client.music.pause(interaction.guild)
                let embed = new MessageEmbed()
                    .setDescription('Pausing the current song.')
                    .setColor(client.colors.success)
                await interaction.reply({ embeds: [embed] })
            } else {
                client.music.resume(interaction.guild)
                let embed = new MessageEmbed()
                    .setDescription('Resuming the the current song.')
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

export const name: string = 'pause'
export const description: string = 'Pauses the song that is currently playing'
export const botPermissions: Array<PermissionString> = [ 'SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
