import { CommandInteraction, PermissionString } from 'discord.js'
import { Bot } from '../client/client'

export interface RunFunction {
    (client: Bot, interaction: CommandInteraction, args?: string[]): Promise<void>
}

export interface Command {
    name: string
    category: string
    options?: Array<any>
    botPermissions: Array<PermissionString>
    userPermissions: Array<PermissionString>
    run: RunFunction
}
