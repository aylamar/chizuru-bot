export interface GuildCache {
    [guildID: string]: {
        musicChannel?: string
        logChannel?: string
        logChannelEdit?: Boolean
        logMessageDelete?: Boolean
        logMessageEdit?: Boolean
    
    }
}

export interface GuildData {
    musicChannel?: string
    logChannel?: string
    logChannelEdit?: Boolean
    logMessageDelete?: Boolean
    logMessageEdit?: Boolean
}
