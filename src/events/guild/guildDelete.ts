import { Guild } from 'discord.js'
import { Bot } from '../../client/client'
import { RunFunction } from '../../interfaces/Event'
import { deleteGuild } from '../../util/Guild'

export const run: RunFunction = async (client: Bot, guild: Guild) => {
    if (!(guild instanceof Guild)) return
    deleteGuild(guild.id)
    client.Starboard.config.delete(guild.id, client)
}

export const name: string = 'guildDelete'
