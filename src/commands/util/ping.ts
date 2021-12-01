import { RunFunction } from '../../interfaces/Command'
import { PermissionString } from 'discord.js'

export const run: RunFunction = async (client, interaction) => {
    let curTime = Date.now()
    let ping = curTime - interaction.createdTimestamp

    await interaction.reply({
        content: `:ping_pong: ~${ping}ms delay between when you ran the command and when I recieved it.`,
        ephemeral: true
    })
}

export const name: string = 'ping'
export const description: string = 'Replies with pong'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
