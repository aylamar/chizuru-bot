import { RunFunction } from '../../interfaces/Command'
import { Interaction, PermissionString } from 'discord.js'
import { Bot } from '../../client/client'
import { clearMusicChannel, setMusicChannel } from '../../util/Guild'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return

    const group = interaction.options.getSubcommandGroup()
    const subCommand = interaction.options.getSubcommand()

    music(interaction, subCommand, client)
}

async function music(interaction: Interaction, subCommand: string, client: Bot) {
    if (!interaction.isCommand()) return

    switch (subCommand) {
        case 'set':
            const channel = interaction.options.getChannel('music-channel')

            if(client.channels.cache.get(channel.id).isText()) {
                await setMusicChannel(interaction.guildId, channel.id, client)
                interaction.reply({
                    content: `Locking music commands to <#${channel.id}>.`,
                    ephemeral: true,
                })
            } else {
                await 
                interaction.reply({
                    content: `This only works for text channels, please try again with a text channel.`,
                    ephemeral: true,
                })
            }
            return

        case 'clear':
            clearMusicChannel(interaction.guildId, client)
            interaction.reply({
                content: `Cleared!`,
                ephemeral: true,
            })
            return
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
                description: 'Require music to be queued in a specific channel',
                type: 1,
                options: [{
                    name: 'music-channel',
                    description: 'Channel to lock music commands to',
                    type: 7,
                }],
            },
            {
                name: 'clear',
                description: 'Clear the music channel, allowing music to be queued anywhere',
                type: 1
            },
        ],
    },
]
