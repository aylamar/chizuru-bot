import { MessageReaction} from 'discord.js'
import { Bot } from '../../client/client'
import { RunFunction } from '../../interfaces/Event'

export const run: RunFunction = async (client: Bot, reaction: MessageReaction) => {
    await client.Starboard.listener(reaction)
}

export const name: string = 'messageReactionAdd'
