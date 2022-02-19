import { PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { replyEmbed } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    let streamer = interaction.options.getString('streamer')

    let res = await client.Streams.delStream(streamer, interaction.channelId, client.logger)
    try {
        switch (res) {
            case 'Success':
                let msgRemove = `You'll no longer be notified when **${streamer}** goes online.`
                return await replyEmbed(client, interaction, { msg: msgRemove, color: client.colors.success })
            case 'Does not exist':
                let msgDel = `You won't receive any notifications for **${streamer}**.`
                return await replyEmbed(client, interaction, { msg: msgDel, color: client.colors.success })
            case 'Failure':
                let msgFail = `Something went wrong, try running this command again.`
                return await replyEmbed(client, interaction, { msg: msgFail, color: client.colors.error })
            default:
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
