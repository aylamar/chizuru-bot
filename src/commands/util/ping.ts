import { RunFunction } from '../../interfaces/Command'
import { PermissionString } from 'discord.js'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let curTime = Date.now()
    let ping = curTime - interaction.createdTimestamp
    interaction.createdTimestamp

    interaction.reply({
        content: `:ping_pong: ~${ping}ms delay between when you ran the command and when I recieved it.`,
        ephemeral: true,
    })
}

export const name: string = 'ping'
export const description: string = 'Replies with pong'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
