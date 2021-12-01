import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    let streamer = interaction.options.getString('streamer')

    let res = await client.Streams.delStream(streamer, interaction.channelId, client.logger)
    try {
        switch (res) {
            case 'Success':
                let successEmbed = new MessageEmbed()
                    .setDescription(`You'll no longer be notified when **${streamer}** goes online.`)
                    .setColor(client.colors.success)
                await interaction.reply({ embeds: [successEmbed] })
                break
            case 'Does not exist':
                let alreadyExistEmbed = new MessageEmbed()
                    .setDescription(`You won't receive any notifications for **${streamer}**.`)
                    .setColor(client.colors.success)
                await interaction.reply({ embeds: [alreadyExistEmbed] })
                break
            case 'Failure':
                let failureEmbed = new MessageEmbed()
                    .setDescription('Something went wrong, try running this command again.')
                    .setColor(client.colors.error)
                await interaction.reply({ embeds: [failureEmbed] })
                break
        }
    } catch (err) {
        client.logger.error(err)
    }
    return
}

export const name: string = 'delstream'
export const description: string = 'Removes a stream from this channel'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'MANAGE_WEBHOOKS']
export const options: Array<Object> = [
    {
        name: 'streamer',
        type: 3,
        description: 'The username of the streamer you\'d like to unfollow',
        required: true
    }
]
