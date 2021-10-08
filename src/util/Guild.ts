import Guild from '../models/guild'
import consola from 'consola'
import { GuildData } from '../interfaces/GuildCache'
import { Bot } from '../client/client'
import { Snowflake } from 'discord-api-types'

export async function getGuild(guildID: string) {
    let guild = await Guild.findById(guildID).lean()

    if (guild) {
        // if guild exists
        let data: GuildData = {
            musicChannel: guild?.music_channel,
            lookupNSFW: guild?.lookup_nsfw,
            logBlacklist: guild?.log_blacklist,
            messageDelete: guild?.log_message_delete,
            messageEdit: guild?.log_message_edit
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
                lookupNSFW: undefined,
                logBlacklist: undefined,
                messageDelete: undefined,
                messageEdit: undefined    
            }
            return data
        } catch (err) {
            consola.error(`Error adding ${guildID} to the database ${err}`)
        }
    } else {
        // if guild exists
        let data: GuildData = {
            musicChannel: guild?.music_channel,
            lookupNSFW: guild?.lookup_nsfw,
            logBlacklist: guild?.log_blacklist,
            messageDelete: guild?.log_message_delete,
            messageEdit: guild?.log_message_edit
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
        return `Locking music commands to <#${channelID}>`
    } catch (err) {
        client.logger.error(err)
        return 'Something went wrong, please try again later.'
    }
}

export async function clearMusicChannel(guildID: string, client: Bot) {
    try {
        let guild = await Guild.findById(guildID)
        guild.music_channel = undefined
        await guild.save()
        client.cache[guildID].musicChannel = undefined
        return 'Music commands can now be used anywhere on the server'
    } catch (err) {
        client.logger.error(err)
        return 'Something went wrong, please try again later.'
    }
}

export async function logBlacklist(guildId: Snowflake, channelId: Snowflake, client: Bot) {
    try {
        let guild = await Guild.findById(guildId)
        if (guild.log_blacklist.includes(channelId)) {
            if (guild.log_blacklist.length === 1) {
                guild.log_blacklist = undefined
                await guild.save()
                client.cache[guildId].logBlacklist = undefined
            } else {
                let dbIdx = guild.log_blacklist.indexOf(channelId)
                guild.log_blacklist.splice(dbIdx, 1)
                await guild.save()
    
                let cacheIdx = client.cache[guildId].logBlacklist.indexOf(channelId)
                client.cache[guildId].logBlacklist.splice(cacheIdx, 1)
            }
            return `<#${channelId}> has been removed from the log blacklist.`
        } else if (guild.log_blacklist === undefined || guild.log_blacklist.length === 0) {
            guild.log_blacklist = [channelId]
            await guild.save()
            client.cache[guildId].logBlacklist = [channelId]
            return `Nothing from <#${channelId}> will be logged.`
        } else {
            guild.log_blacklist.push(channelId)
            await guild.save()
            client.cache[guildId].logBlacklist.push(channelId)
            return `Nothing from <#${channelId}> will be logged.`
        }
    } catch (err) {
        client.logger.error(err)
        return 'Something went wrong, please try again later.'
    }
}

export async function logMessageDelete(guildId: Snowflake, channelId: Snowflake, client: Bot) {
    try {
        let guild = await Guild.findById(guildId)
        if (guild.log_message_delete.includes(channelId)) {
            if (guild.log_message_delete.length === 1) {
                guild.log_message_delete = undefined
                await guild.save()
                client.cache[guildId].messageDelete = undefined
            } else {
                let dbIdx = guild.log_message_delete.indexOf(channelId)
                guild.log_message_delete.splice(dbIdx, 1)
                await guild.save()
    
                let cacheIdx = client.cache[guildId].messageDelete.indexOf(channelId)
                client.cache[guildId].messageDelete.splice(cacheIdx, 1)
            }
            return `No longer logging deleted messages to the <#${channelId}>.`
        } else if (guild.log_message_delete === undefined || guild.log_message_delete.length === 0) {
            guild.log_message_delete = [channelId]
            await guild.save()
            client.cache[guildId].messageDelete = [channelId]
            return `Now logging deleted messages to <#${channelId}>.`
        } else {
            guild.log_message_delete.push(channelId)
            await guild.save()
            client.cache[guildId].messageDelete.push(channelId)
            return `Now logging deleted messages to <#${channelId}>.`
        }
    } catch (err) {
        client.logger.error(err)
        return 'Something went wrong, please try again later.'
    }
}

export async function logMessageEdit(guildId: Snowflake, channelId: Snowflake, client: Bot) {
    try {
        let guild = await Guild.findById(guildId)
        if (guild.log_message_edit.includes(channelId)) {
            if (guild.log_message_edit.length === 1) {
                guild.log_message_edit = undefined
                await guild.save()
                client.cache[guildId].messageEdit = undefined
            } else {
                let dbIdx = guild.log_message_edit.indexOf(channelId)
                guild.log_message_edit.splice(dbIdx, 1)
                await guild.save()
    
                let cacheIdx = client.cache[guildId].messageEdit.indexOf(channelId)
                client.cache[guildId].messageEdit.splice(cacheIdx, 1)
            }
            return `No longer logging edited messages to the <#${channelId}>.`
        } else if (guild.log_message_edit === undefined || guild.log_message_edit.length === 0) {
            guild.log_message_edit = [channelId]
            await guild.save()
            client.cache[guildId].messageEdit = [channelId]
            return `Now logging edited messages to <#${channelId}>.`
        } else {
            guild.log_message_edit.push(channelId)
            await guild.save()
            client.cache[guildId].messageEdit.push(channelId)
            return `Now logging edited messages to <#${channelId}>.`
        }
    } catch (err) {
        client.logger.error(err)
        return 'Something went wrong, please try again later.'
    }
}

export async function toggleLookupNSFW(guildID: string, client: Bot) {
    try {
        let guild = await Guild.findById(guildID)
        if (guild.lookup_nsfw !== true) {
            guild.lookup_nsfw = true
            await guild.save()
            client.cache[guildID].lookupNSFW = true
            return 'NSFW anime & manga will now be displayed.'
        } else {
            guild.lookup_nsfw = undefined
            await guild.save()
            client.cache[guildID].lookupNSFW = undefined
            return 'NSFW anime & manga will no longer be displayed.'
        }
    } catch (err) {
        client.logger.error(err)
        return 'Something went wrong, please try again later.'
    }
}
