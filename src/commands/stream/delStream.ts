import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import ChannelMgr from '../../util/ChannelMgr'
import consola from 'consola'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let streamer = interaction.options.getString('streamer')

    let res = await ChannelMgr.delStream(streamer, interaction.channelId)
    try {
        switch(res) {
            case 'Does not exist':
                let alreadyExistEmbed = new MessageEmbed()
                    .setDescription(`You won't recieve any notifications for **${streamer}**.`)
                    .setColor(client.colors.error)
                await interaction.reply({embeds: [alreadyExistEmbed]})
                break
            case 'Success':
                let successEmbed = new MessageEmbed()
                    .setDescription(`You'll no longer be notified when **${streamer}** goes online.`)
                    .setColor(client.colors.success)
                await interaction.reply({embeds: [successEmbed]})
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
        description: "The username of the streamer you'd like to unfollow",
        required: true,
    },
]
