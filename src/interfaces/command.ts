import {
    CacheType,
    ChatInputCommandInteraction,
    PermissionsString,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { Bot } from '../classes/bot';

export interface RunCommand {
    (client: Bot, args: ChatInputCommandInteraction<CacheType>): void;
}

export interface Command {
    name: string;
    permissions: PermissionsString[];
    description: string;
    aliases: string[];
    run: RunCommand;
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
}
