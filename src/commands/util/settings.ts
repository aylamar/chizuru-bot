import { RunFunction } from '../../interfaces/Command'
import { Interaction, PermissionString } from 'discord.js'
import { Bot } from '../../client/client'
import { clearLogChannel, clearMusicChannel, setLogChannel, setMusicChannel, toggleLogChannelEdit, toggleLogMessageDelete, toggleLogMessageEdit } from '../../util/Guild'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return

    const group = interaction.options.getSubcommandGroup()
    const subCommand = interaction.options.getSubcommand()

    switch (group) {
        case 'music':
            music(interaction, subCommand, client)
            break
        case 'log':
            log(interaction, subCommand, client)
            break
    }
}

async function music(interaction: Interaction, subCommand: string, client: Bot) {
    if (!interaction.isCommand()) return

    switch (subCommand) {
        case 'set':
            const channel = interaction.options.getChannel('music-channel')

            if (client.channels.cache.get(channel.id).isText()) {
                let musicChannel = await setMusicChannel(interaction.guildId, channel.id, client)
                interaction.reply({
                    content: musicChannel,
                })
            } else {
                await interaction.reply({
                    content: `This only works for text channels, please try again with a text channel.`,
                    ephemeral: true,
                })
            }
            return
        case 'clear':
            let musicClear = await clearMusicChannel(interaction.guildId, client)
            interaction.reply({
                content: musicClear,
            })
            return
    }
}

async function log(interaction: Interaction, subCommand: string, client: Bot) {
    if (!interaction.isCommand()) return

    switch (subCommand) {
        case 'set':
            const channel = interaction.options.getChannel('log-channel')

            if (client.channels.cache.get(channel.id).isText()) {
                let logChannel = await setLogChannel(interaction.guildId, channel.id, client)
                interaction.reply({
                    content: logChannel,
                })
            } else {
                await interaction.reply({
                    content: `This only works for text channels, please try again with a text channel.`,
                    ephemeral: true,
                })
            }
            return
        case 'clear':
            let clearLog = await clearLogChannel(interaction.guildId, client)
            interaction.reply({content: clearLog})
            return
        case 'toggle':
            const choice = interaction.options.getString('setting')
            switch (choice) {
                case 'message-delete':
                    let msgDelete = await toggleLogMessageDelete(interaction.guildId, client)
                    interaction.reply({content: msgDelete, ephemeral: true})
                    return
                case 'message-edit':
                    let msgEdit = await toggleLogMessageEdit(interaction.guildId, client)
                    interaction.reply({content: msgEdit, ephemeral: true})
                    return
                case 'channel-edit':
                    let chnlEdit = await toggleLogChannelEdit(interaction.guildId, client)
                    interaction.reply({content: chnlEdit, ephemeral: true})
                    return
            }
    }
}

export const name: string = 'settings'
export const description: string = 'modify settings on your server'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['MANAGE_GUILD']
export const options: Array<any> = [
    {
        name: 'music',
        type: 2,
        description: 'Music options',
        options: [
            {
                name: 'set',
                description: 'Lock music commands to a specific channel',
                type: 1,
                options: [{
                    name: 'music-channel',
                    description: 'The channel to lock music commands to',
                    type: 7,
                }],
            },
            {
                name: 'clear',
                description: 'Allow music commands to be used anywhere',
                type: 1
            },
        ],
    },
    {
        name: 'log',
        type: 2,
        description: 'Logging options',
        options: [
            {
                name: 'set',
                description: 'Begin logging changes to a specific channel',
                type: 1,
                options: [{
                    name: 'log-channel',
                    description: 'The channel to log things to',
                    type: 7,
                }],
            },
            {
                name: 'clear',
                description: 'Allow music commands to be used anywhere',
                type: 1
            },
            {
                name: 'toggle',
                description: 'Toggle logging of specific actions',
                type: 1,
                options: [{
                    name: 'setting',
                    description: 'test',
                    type: 3,
                    choices: [
                        {
                            name: 'channel-edit',
                            value: 'channel-edit',
                        },
                        {
                            name: 'message-delete',
                            value: 'message-delete'
                        },
                        {
                            name: 'message-edit',
                            value: 'message-edit'
                        }
                    ]
    
                }]
            }
        ]
    }
]
