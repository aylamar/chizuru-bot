export interface GuildCache {
    [guildID: string]: {
        musicChannel?: string
        logChannel?: string
    }
}

export interface GuildData {
    musicChannel?: string
    logChannel?: string
}
