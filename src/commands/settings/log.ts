import { RunFunction } from '../../interfaces/Command'
import { PermissionString } from 'discord.js'
import { logMessageDelete, logMessageEdit } from '../../util/Guild'

export const run: RunFunction = async (client, interaction) => {
    const channel = interaction.options.getChannel('channel')
    const setting = interaction.options.getString('setting')

    switch (setting) {
        case 'message-delete':
            let msgDelete = await logMessageDelete(interaction.guildId, channel.id, client)
            interaction.reply({ content: msgDelete, ephemeral: true })
            return
        case 'message-edit':
            let msgEdit = await logMessageEdit(interaction.guildId, channel.id, client)
            interaction.reply({ content: msgEdit, ephemeral: true })
            return
    }
}

export const name: string = 'log'
export const description: string = 'Toggle log settings in different channels'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['MANAGE_GUILD']
export const options: Array<any> = [
    {
        name: 'channel',
        description: 'The channel to log things to',
        type: 7,
        required: true,
    },
    {
        name: 'setting',
        description: 'The event to listen for',
        type: 3,
        required: true,
        choices: [
            {
                name: 'message-delete',
                value: 'message-delete',
            },
            {
                name: 'message-edit',
                value: 'message-edit',
            },
        ],
    },
]
