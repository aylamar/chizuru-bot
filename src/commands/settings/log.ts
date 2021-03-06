import { RunFunction } from '../../interfaces/Command'
import { PermissionString } from 'discord.js'
import { logBan, logBlacklist, logMessageDelete, logMessageEdit, logVoice } from '../../util/Guild'
import { replyMessage } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    const option = interaction.options.getSubcommand()
    const channel = interaction.options.getChannel('channel')

    switch (option) {
        case 'blacklist':
            let msg = await logBlacklist(interaction.guildId, channel.id, client)
            return await replyMessage(client, interaction, msg)
        case 'toggle':
            let resolvedChannel = client.channels.resolve(channel.id)
            if (!resolvedChannel.isText()) {
                let msg = 'Changes can only be logged ot ext channel.'
                return await replyMessage(client, interaction, msg)
            }

            const setting = interaction.options.getString('setting')
            switch (setting) {
                case 'message-delete':
                    let msgDelete = await logMessageDelete(interaction.guildId, channel.id, client)
                    return await replyMessage(client, interaction, msgDelete)
                case 'message-edit':
                    let msgEdit = await logMessageEdit(interaction.guildId, channel.id, client)
                    return await replyMessage(client, interaction, msgEdit)
                case 'ban':
                    let msgBan = await logBan(interaction.guildId, channel.id, client)
                    return await replyMessage(client, interaction, msgBan)
                case 'voice':
                    let msgVoice = await logVoice(interaction.guildId, channel.id, client)
                    return await replyMessage(client, interaction, msgVoice)
                default:
                    return
            }
    }
}

export const name: string = 'log'
export const description: string = 'Toggle log settings in different channels'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['MANAGE_GUILD']
export const options: Array<any> = [
    {
        name: 'blacklist',
        description: 'Prevent anything in a specific channel from being logged',
        type: 1,
        options: [
            {
                name: 'channel',
                description: 'The channel to blacklist or un-blacklist',
                type: 7,
                required: true
            }
        ]
    },
    {
        name: 'toggle',
        description: 'Toggle a log setting for a specific channel',
        type: 1,
        options: [
            {
                name: 'channel',
                description: 'The channel to log things to',
                type: 7,
                required: true
            },
            {
                name: 'setting',
                description: 'The event to listen for',
                type: 3,
                required: true,
                choices: [
                    {
                        name: 'message-delete',
                        value: 'message-delete'
                    },
                    {
                        name: 'message-edit',
                        value: 'message-edit'
                    },
                    {
                        name: 'ban',
                        value: 'ban'
                    },
                    {
                        name: 'voice-states',
                        value: 'voice'
                    }
                ]
            }
        ]
    }
]
