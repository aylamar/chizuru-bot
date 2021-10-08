import { RunFunction } from '../../interfaces/Command'
import { PermissionString } from 'discord.js'
import { clearLogChannel, setLogChannel, toggleLogChannelEdit, toggleLogMessageDelete, toggleLogMessageEdit, } from '../../util/Guild'

export const run: RunFunction = async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand()
    switch (subCommand) {
        case 'set':
            const channel = interaction.options.getChannel('channel')

            if (client.channels.cache.get(channel.id).isText()) {
                let logChannel = await setLogChannel(interaction.guildId, channel.id, client)
                interaction.reply({content: logChannel,})
            } else {
                await interaction.reply({
                    content: `This only works for text channels, please try again with a text channel.`,
                    ephemeral: true,
                })
            }
            return
        case 'stop':
            let clearLog = await clearLogChannel(interaction.guildId, client)
            interaction.reply({ content: clearLog })
            return
        case 'toggle':
            const choice = interaction.options.getString('setting')
            switch (choice) {
                case 'message-delete':
                    let msgDelete = await toggleLogMessageDelete(interaction.guildId, client)
                    interaction.reply({ content: msgDelete, ephemeral: true })
                    return
                case 'message-edit':
                    let msgEdit = await toggleLogMessageEdit(interaction.guildId, client)
                    interaction.reply({ content: msgEdit, ephemeral: true })
                    return
                case 'channel-edit':
                    let chnlEdit = await toggleLogChannelEdit(interaction.guildId, client)
                    interaction.reply({ content: chnlEdit, ephemeral: true })
                    return
            }
    }
}

export const name: string = 'log'
export const description: string = 'Modify log settings on the server'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['MANAGE_GUILD']
export const options: Array<any> = [
    {
        name: 'set',
        description: 'Begin logging changes to a specific channel',
        type: 1,
        options: [
            {
                name: 'channel',
                description: 'The channel to log things to',
                type: 7,
                required: true,
            },
        ],
    },
    {
        name: 'stop',
        description: 'Stop logging on this server',
        type: 1,
    },
    {
        name: 'toggle',
        description: 'Toggle logging of specific actions',
        type: 1,
        options: [
            {
                name: 'setting',
                description: 'test',
                type: 3,
                require: true,
                choices: [
                    {
                        name: 'channel-edit',
                        value: 'channel-edit',
                    },
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
        ],
    },
]
