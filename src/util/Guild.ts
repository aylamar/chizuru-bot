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
            logChannelEdit: guild?.log_channel_edit,
            logMessageDelete: guild?.log_message_delete,
            logMessageEdit: guild?.log_message_edit
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
                logChannelEdit: undefined,
                logMessageDelete: undefined,
                logMessageEdit: undefined    
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
            logChannelEdit: guild?.log_channel_edit,
            logMessageDelete: guild?.log_message_delete,
            logMessageEdit: guild?.log_message_edit
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

export async function setLogChannel(guildID: string, channelID: string, client: Bot) {
    try {
        let guild = await Guild.findById(guildID)
        guild.log_channel = channelID
        guild.save()
        client.cache[guildID].logChannel = channelID
        return `I'll start logging changes to <#${channelID}>`
    } catch (err) {
        client.logger.error(err)
        return 'Something went wrong, please try again later'
    }
}

export async function clearLogChannel(guildID: string, client: Bot) {
    try {
        let guild = await Guild.findById(guildID)
        guild.log_channel = undefined
        await guild.save()
        client.cache[guildID].logChannel = undefined
        return 'Nothing will be logged on this server.'
    } catch (err) {
        client.logger.error(err)
        return 'Something went wrong, please try later.'
    }
}

export async function toggleLogChannelEdit(guildID: string, client: Bot) {
    try {
        let guild = await Guild.findById(guildID)
        if (guild.log_channel_edit !== true) {
            guild.log_channel_edit = true
            await guild.save()
            client.cache[guildID].logChannelEdit = true
            return 'Now logging channel edits to the log channel.'
        } else {
            guild.log_channel_edit = undefined
            await guild.save()
            client.cache[guildID].logChannelEdit = undefined
            return 'No longer logging channel edits to the log channel.'
        }
    } catch (err) {
        client.logger.error(err)
        return 'Something went wrong, please try again later.'
    }
}

export async function toggleLogMessageDelete(guildID: string, client: Bot) {
    try {
        let guild = await Guild.findById(guildID)
        if (guild.log_message_delete !== true) {
            guild.log_message_delete = true
            await guild.save()
            client.cache[guildID].logMessageDelete = true
            return 'Now logging deleted messages to the log channel.'
        } else {
            guild.log_message_delete = undefined
            await guild.save()
            client.cache[guildID].logMessageDelete = undefined
            return 'No longer logging deleted messages to the log channel.'
        }
    } catch (err) {
        client.logger.error(err)
        return 'Something went wrong, please try again later.'
    }
}

export async function toggleLogMessageEdit(guildID: string, client: Bot) {
    try {
        let guild = await Guild.findById(guildID)
        if (guild.log_message_edit !== true) {
            guild.log_message_edit = true
            await guild.save()
            client.cache[guildID].logMessageEdit = true
            return 'Now logging message edits to the log channel.'
        } else {
            guild.log_message_edit = undefined
            await guild.save()
            client.cache[guildID].logMessageEdit = undefined
            return 'No longer logging message edits to the log channel.'
        }
    } catch (err) {
        client.logger.error(err)
        return 'Something went wrong, please try again later.'
    }
}
