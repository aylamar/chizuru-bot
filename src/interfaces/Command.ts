import { Bot } from '../client/client'
import { Interaction } from 'discord.js'

export interface RunFunction {
    (client: Bot, interaction: Interaction, args?: string[]): Promise<void>
}

export interface Command {
    name: string
    category: string
    options?: Array<any>
    run: RunFunction
}
