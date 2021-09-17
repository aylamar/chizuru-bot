import { Guild } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { createGuild } from '../../util/Guild'

export const run: RunFunction = async (guild) => {
    if (!(guild instanceof Guild)) return
    createGuild(guild.id)
}

export const name: string = 'guildCreate'
