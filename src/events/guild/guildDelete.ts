import { Guild } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { deleteGuild } from '../../util/Guild'

export const run: RunFunction = async (guild) => {
    if (!(guild instanceof Guild)) return
    deleteGuild(guild.id)
}

export const name: string = 'guildDelete'
