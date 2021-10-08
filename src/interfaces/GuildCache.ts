export interface GuildCache {
    [guildID: string]: {
        musicChannel?: string
        lookupNSFW?: boolean
        messageDelete?: string[]
        messageEdit?: string[]
    }
}

export interface GuildData {
    musicChannel?: string
    lookupNSFW?: boolean
    messageDelete?: string[]
    messageEdit?: string[]
}
