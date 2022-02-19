import { PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { deferReply, replyEmbed } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    await deferReply(client, interaction)
    let streamer = interaction.options.getString('streamer')

    let res = await client.Streams.addStream(streamer, interaction.channelId, interaction.guildId, client)
    try {
        switch (res) {
            case 'Success':
                let msgSuccess = `You'll be notified when **${streamer}** goes online.`
                return await replyEmbed(client, interaction, { msg: msgSuccess, color: client.colors.success })
            case 'Already exists':
                let msgExists = `You already get notifications for **${streamer}** here.`
                return await replyEmbed(client, interaction, { msg: msgExists, color: client.colors.error })
            case 'Unable to locate':
                let msgUnable = `Unable to locate **${streamer}** for some reason, is this the right channel name?`
                return await replyEmbed(client, interaction, { msg: msgUnable, color: client.colors.error })
            case 'Failure':
                let msgFailure = 'Something went wrong, try running this command again.'
                return await replyEmbed(client, interaction, { msg: msgFailure, color: client.colors.error })
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
        description: 'The username of the streamer you\'d like to follow',
        required: true
    }
]
