import Guild from '../models/guild'
import consola from 'consola'
import { GuildData } from '../interfaces/GuildCache'
import { Bot } from '../client/client'

export async function getGuild(guildID: string) {
    let guild = await Guild.findById(guildID).lean()

    if (guild) {
        // if guild exists
        let data: GuildData = {
            musicChannel: guild?.music_channel,
            logChannel: guild?.log_channel,
        }

        return data
    } else {
        // if no guild exists
        let data = await createGuild(guildID)
        return data
    }
}

export async function createGuild(guildID: string) {
    let guild = await Guild.findById(guildID).lean()

    if (!guild) {
        // if guild does not exist
        try {
            const guildDB = new Guild({
                _id: guildID,
            })
            await guildDB.save()
            consola.success(`Successfully added ${guildID} to the database.`)
            let data: GuildData = {
                musicChannel: undefined,
                logChannel: undefined,
            }

            return data
        } catch (err) {
            consola.error(`Error adding ${guildID} to the database ${err}`)
        }
    } else {
        // if guild exists
        let data: GuildData = {
            musicChannel: guild?.music_channel,
            logChannel: guild?.log_channel,
        }

        return data
    }
}

export async function deleteGuild(guildID: string) {
    try {
        await Guild.findByIdAndDelete(guildID)
        consola.success(`Successfully removed ${guildID} from the database.`)
        return
    } catch (err) {
        consola.error(`Error removing ${guildID} from the database ${err}`)
    }
}

export async function setMusicChannel(guildID: string, channelID: string, client: Bot) {
    try {
        let guild = await Guild.findById(guildID)
        guild.music_channel = channelID
        guild.save()
        client.cache[guildID].musicChannel = channelID
        return true
    } catch (err) {
        client.logger.error(err)
        return false
    }
}

export async function clearMusicChannel(guildID: string, client: Bot) {
    try {
        let guild = await Guild.findById(guildID)
        guild.music_channel = undefined
        await guild.save()
        client.cache[guildID].musicChannel = undefined
        return true
    } catch (err) {
        client.logger.error(err)
        return false
    }
}

export async function setLogChannel(guildID: string, channelID: string, client: Bot) {
    try {
        let guild = await Guild.findById(guildID)
        guild.log_channel = channelID
        guild.save()
        client.cache[guildID].logChannel = channelID
        return true
    } catch (err) {
        client.logger.error(err)
        return false
    }
}

export async function clearLogChannel(guildID: string, client: Bot) {
    try {
        let guild = await Guild.findById(guildID)
        guild.log_channel = undefined
        await guild.save()
        client.cache[guildID].logChannel = undefined
        return true
    } catch (err) {
        client.logger.error(err)
        return false
    }
}
