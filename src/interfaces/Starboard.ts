import { Snowflake } from "discord.js";
import { Bot } from "../client/client";

export interface StarboardClientOptions {
    client: Bot
    Guilds?: StarboardGuild[]
}

export interface StarboardGuildOptions {
    starCount: number
    starboardChannel: Snowflake
    starEmote: string
    bannedUsers: string[]
    blacklistedChannels: string[]
}

export interface starMessageData {
    origin: Snowflake
    id: Snowflake
}

export interface StarboardGuild {
    id: Snowflake
    options: StarboardGuildOptions
}
