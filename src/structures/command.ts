import {
    ApplicationCommandOptionData,
    ApplicationCommandType,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    PermissionsString,
} from 'discord.js';
import { Chizuru } from '../interfaces';
import { Bot } from './bot';

export class Command implements ChatInputApplicationCommandData {
    name: string;
    description: string;
    isDisabled: boolean;
    dmPermission: boolean;
    defaultMemberPermissions: PermissionsString[];
    type: ApplicationCommandType.ChatInput;
    module: Chizuru.CommandModule;
    options: ApplicationCommandOptionData[];
    execute: RunCommand;

    constructor(args: CommandArgs) {
        this.name = args.name;
        this.description = args.description;
        this.isDisabled = args.isDisabled;
        this.dmPermission = args.dmPermission;
        this.defaultMemberPermissions = args.defaultMemberPermissions;
        this.type = ApplicationCommandType.ChatInput;
        this.module = args.module;
        this.options = args.options;
        this.execute = args.execute;
    }
}

interface RunCommand {
    (client: Bot, args: ChatInputCommandInteraction): void;
}

export interface CommandArgs extends ChatInputApplicationCommandData {
    name: string;
    description: string;
    isDisabled: boolean;
    dmPermission: boolean;
    defaultMemberPermissions: PermissionsString[];
    module: Chizuru.CommandModule;
    options: ApplicationCommandOptionData[];
    execute: RunCommand;
}
