import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    await interaction.deferReply()
    let streamer = interaction.options.getString('streamer')

    let res = await client.Streams.addStream(streamer, interaction.channelId, interaction.guildId, client)
    try {
        switch(res) {
            case 'Success':
                let successEmbed = new MessageEmbed()
                    .setDescription(`You'll be notified when **${streamer}** goes online.`)
                    .setColor(client.colors.success)
                await interaction.editReply({embeds: [successEmbed]})
                break
            case 'Already exists':
                let alreadyExistEmbed = new MessageEmbed()
                    .setDescription(`You already get notifications for **${streamer}** here.`)
                    .setColor(client.colors.error)
                await interaction.editReply({embeds: [alreadyExistEmbed]})
                break
            case 'Unable to locate':
                let unableEmbed = new MessageEmbed()
                    .setDescription(`Unable to locate **${streamer}** for some reason, is this the right channel name?`)
                    .setColor(client.colors.error)
                await interaction.editReply({embeds: [unableEmbed]})
                break
            case 'Failure':
                let failureEmbed = new MessageEmbed()
                    .setDescription('Something went wrong, try running this command again.')
                    .setColor(client.colors.error)
                await interaction.reply({embeds: [failureEmbed]})
                break
        }
    } catch (err) {
        client.logger.error(err)
    }
    return
}

export const name: string = 'addstream'
export const description: string = 'Start following a stream in this channel'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'MANAGE_WEBHOOKS']
export const options: Array<Object> = [
    {
        name: 'streamer',
        type: 3,
        description: "The username of the streamer you'd like to follow",
        required: true,
    },
]
