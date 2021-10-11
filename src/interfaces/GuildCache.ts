export interface GuildCache {
    [guildID: string]: {
        musicChannel?: string
        lookupNSFW?: boolean
        logBlacklist?: string[]
        logBan?: string[]
        logVoice?: string[]
        messageDelete?: string[]
        messageEdit?: string[]
        streamPing?: boolean
    }
}

export interface GuildData {
    musicChannel?: string
    lookupNSFW?: boolean
    logBlacklist?: string[]
    logBan?: string[]
    logVoice?: string[]
    messageDelete?: string[]
    messageEdit?: string[]
    streamPing?: boolean
}
