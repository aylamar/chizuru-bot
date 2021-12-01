import { Guild } from 'discord.js'
import { Bot } from '../../client/client'
import { RunFunction } from '../../interfaces/Event'
import { createGuild } from '../../util/Guild'

export const run: RunFunction = async (client: Bot, guild: Guild) => {
    if (!(guild instanceof Guild)) return
    await createGuild(guild.id)
}

export const name: string = 'guildCreate'
