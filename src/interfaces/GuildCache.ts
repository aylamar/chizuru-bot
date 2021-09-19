export interface GuildCache {
    [guildID: string]: {
        musicChannel?: string
        lookupNSFW?: Boolean
        logChannel?: string
        logChannelEdit?: Boolean
        logMessageDelete?: Boolean
        logMessageEdit?: Boolean    
    }
}

export interface GuildData {
    musicChannel?: string
    lookupNSFW?: Boolean
    logChannel?: string
    logChannelEdit?: Boolean
    logMessageDelete?: Boolean
    logMessageEdit?: Boolean
}
