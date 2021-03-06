import { RunFunction } from '../../interfaces/Command'
import { PermissionString } from 'discord.js'
import { clearMusicChannel, setMusicChannel } from '../../util/Guild'
import { replyEmbed, replyMessage } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand()
    switch (subCommand) {
        case 'set':
            const channel = interaction.options.getChannel('channel')

            if (client.channels.cache.get(channel.id).isText()) {
                return await replyEmbed(client, interaction, {
                    msg: await setMusicChannel(interaction.guildId, channel.id, client),
                    color: client.colors.blurple
                })
            } else {
                let msg = `This only works for text channels, please try again with a text channel.`
                return await replyMessage(client, interaction, msg)
            }
        case 'clear':
            return await replyEmbed(client, interaction, {
                msg: await clearMusicChannel(interaction.guildId, client),
                color: client.colors.blurple
            })
    }
}

export const name: string = 'music'
export const description: string = 'Modify music settings on the server'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['MANAGE_GUILD']
export const options: Array<any> = [
    {
        name: 'set',
        description: 'Lock music commands to a specific channel',
        type: 1,
        options: [
            {
                name: 'channel',
                type: 7,
                required: true,
                description: 'The channel to lock music commands to'
            }
        ]
    },
    {
        name: 'clear',
        description: 'Allow music commands to be used anywhere',
        type: 1
    }
]
