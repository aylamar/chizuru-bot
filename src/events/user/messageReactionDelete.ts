import { MessageReaction, User } from 'discord.js'
import { Bot } from '../../client/client'
import { RunFunction } from '../../interfaces/Event'

export const run: RunFunction = async (client: Bot, reaction: MessageReaction, user: User) => {
    client.Starboard.listener(reaction)
}

export const name: string = 'messageReactionDelete'
