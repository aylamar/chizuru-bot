export interface GuildCache {
    [guildID: string]: {
        musicChannel?: string
        lookupNSFW?: boolean
        logBlacklist?: string[]
        logBan?: string[]
        logVoice?: string[]
        messageDelete?: string[]
        messageEdit?: string[]
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
}
