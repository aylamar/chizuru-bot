import { Player } from 'discord-music-player';
import {
    ApplicationCommand,
    ApplicationCommandData,
    ChatInputApplicationCommandData,
    Client,
    Collection,
    GatewayIntentBits,
    Guild,
    GuildResolvable,
    Partials,
} from 'discord.js';
import type { Logger } from 'winston';
import { Chizuru } from '../interfaces';
import { getLogger } from '../services';
import { getFiles } from '../utils';
import { CommandArgs } from './command';
import { Event, PlayerEvent } from './event';
import { Starboard } from './starboard';
import { Streams } from './stream';
import Twitch from './twitch';

export class Bot extends Client<true> {
    public logger: Logger;
    public colors: Chizuru.EmbedColors;
    commands: Collection<string, CommandArgs> = new Collection();
    public player: Player;
    public twitch: Twitch;
    public starboard: Starboard;
    private streams: Streams;
    private events: Collection<string, Event> = new Collection();

    public constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.MessageContent,
            ],
            partials: [Partials.Message, Partials.Channel, Partials.Reaction],
        });

        if (!process.env.TWITCH_CLIENT_ID) throw new Error('Twitch client id is not set');
        if (!process.env.TWITCH_SECRET) throw new Error('Twitch client secret is not set');

        this.logger = getLogger();
        this.logger.info('Chizuru Bot is starting up...', { label: 'bot' });
        this.player = new Player(this, { deafenOnJoin: true, volume: 125 });
        this.twitch = new Twitch(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_SECRET, this.logger);
        this.streams = new Streams(this);
        this.starboard = new Starboard(this);

        // note: Discord requires decimal color codes
        this.colors = {
            error: 15158332,
            warn: 15651330,
            success: 3066993,
            purple: 10181046,
            blurple: 7506394,
            twitch: 10181046,
            anilist: 4172286,
        };
    }

    public async start(): Promise<void> {
        this.logger.info('Chizuru Bot is starting up...');
        // run loadEvents and loadCommands in parallel
        await Promise.all([this.loadEvents(), this.loadCommands()]);
        await this.login(process.env.DISCORD_TOKEN);

        let start = process.hrtime.bigint();
        // fetch and update or create global commands
        const globalAppCommands = await this.application.commands.fetch();
        const globalCommands = await this.getCommandsByModule([Chizuru.CommandModule.Global]);
        globalCommands.map(command => this.updateOrCreateGlobal(globalAppCommands, command));

        let result = process.hrtime.bigint();
        this.logger.info(`Spent ${(result - start) / BigInt(1000000)}ms deploying global commands commands`);

        // deploy admin commands and cleanup global commands
        await Promise.all([
            await this.deployAdminCommands(),
            await this.cleanGlobalCommands(globalAppCommands, globalCommands),
        ]);
    }

    public async getCommandsByModule(modules: Chizuru.CommandModule[]): Promise<Collection<string, CommandArgs>> {
        return this.commands.filter(command => modules.includes(command.module));
    }

    public async deployGuildCommands(commands: Collection<string, CommandArgs>, guild: Guild) {
        const guildCommands = await guild.commands.fetch();
        for (const command of commands.values()) {
            await this.updateOrCreateGuildCommand(guildCommands, command, guild);
        }
    }

    public async cleanGuildCommands(commands: Collection<string, CommandArgs>, guild: Guild) {
        const guildCommands = await guild.commands.fetch();
        for (const command of guildCommands.values()) {
            if (!commands.has(command.name)) {
                this.logger.debug(`Found extra guild command /${command.name} in ${guild.name}, deleting from guild`);
                await command.delete();
            }
        }
    }

    private async cleanGlobalCommands(
        appCommands: Collection<string, ApplicationCommand<{ guild: GuildResolvable }>>,
        commands: Collection<string, CommandArgs>
    ) {
        for (const command of appCommands.values()) {
            if (!commands.has(command.name)) {
                this.logger.debug(`Found extra global command /${command.name}, deleting from global commands`);
                await command.delete();
            }
        }
    }

    private async deployAdminCommands() {
        let start = process.hrtime.bigint();
        if (!process.env.GUILD_ID) throw new Error('No GUILD_ID set in .env file');
        const adminCommands = await this.getCommandsByModule([
            Chizuru.CommandModule.Admin,
            Chizuru.CommandModule.Music,
        ]);

        const guild = await this.guilds.fetch(process.env.GUILD_ID);
        if (!guild) throw new Error('No GUILD_ID set in .env file');

        await this.deployGuildCommands(adminCommands, guild);
        await this.cleanGuildCommands(adminCommands, guild);
        let result = process.hrtime.bigint();
        this.logger.info(`Spent ${(result - start) / BigInt(1000000)}ms deploying admin commands`);
    }

    private async loadEvents() {
        let start = process.hrtime.bigint();
        const events = await getFiles(`${__dirname}/../events`);
        let eventCount = 0;
        for (const file of events) {
            const eventImport: any = await import(file);
            let event: Event | PlayerEvent;
            if (file.includes('/events/player')) {
                event = eventImport.default as PlayerEvent;
                event.startListener(this);
            } else {
                event = eventImport.default as Event;
                this.events.set(event.name, event);
                event.startListener(this);
            }
            eventCount++;
            this.logger.debug(
                `Loaded event ${event.name} for ${file.includes('/events/player') ? 'player' : 'client'}`
            );
        }
        let result = process.hrtime.bigint();
        this.logger.info(`Spent ${(result - start) / BigInt(1000000)}ms loading ${eventCount} events`);
    }

    private async loadCommands() {
        let start = process.hrtime.bigint();
        const commandFiles = await getFiles(`${__dirname}/../commands`);
        let commandCount = 0;
        for (const file of commandFiles) {
            // skip sub commands
            if (file.includes('subCommand')) continue;

            const commandImport: any = await import(file);
            const command: CommandArgs = commandImport.default;
            this.commands.set(command.name, command);
            this.logger.debug(`Loaded command /${command.name}`);
            commandCount++;
        }
        let result = process.hrtime.bigint();
        this.logger.info(`Spent ${(result - start) / BigInt(1000000)}ms loading ${commandCount} commands`);
    }

    private async updateOrCreateGuildCommand(
        guildCommands: Collection<string, ApplicationCommand>,
        data: ChatInputApplicationCommandData,
        guild: Guild
    ) {
        const guildCommand = guildCommands.find(command => command.name === data.name);
        if (!guildCommand) {
            this.logger.debug(`Creating command /${data.name} in guild ${guild.name}`);
            return await guild.commands.create(data);
        }

        if (!data.description) return;
        let tmpNewCommand = {
            ...guildCommand,
            name: data.name,
            description: data.description,
            options: data.options,
            type: data.type,
            dmPermission: null,
        } as ApplicationCommand;

        if (guildCommand.equals(tmpNewCommand)) {
            this.logger.debug(`Command /${data.name} is up to date in guild ${guild.name}`);
            return;
        } else {
            this.logger.debug(`Updating command /${data.name} in guild ${guild.name}`);
            return await guildCommand.edit(data);
        }
    }

    private async updateOrCreateGlobal(
        botCommands: Collection<string, ApplicationCommand<{ guild: GuildResolvable }>>,
        data: ApplicationCommandData
    ) {
        const botCommand = botCommands.find(botCommand => botCommand.name === data.name);
        if (!botCommand) {
            this.logger.debug(`Creating command ${data.name}, it doesn't exist`);
            return await this.application.commands.create(data);
        }

        if (botCommand.equals(data)) {
            this.logger.debug(`Command /${data.name} is up to date`);
            return;
        } else {
            this.logger.debug(`Command /${data.name} is out of date, updating now`);
            return await this.application.commands.edit(botCommand.id, data);
        }
    }
}
