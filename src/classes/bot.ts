import { Player } from 'discord-music-player';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import type { Logger } from 'winston';
import { Command, EmbedColors, Event, PlayerEvent } from '../interfaces';
import { getLogger } from '../services';
import { getFiles } from '../utils';
import { Streams } from './stream';
import { Starboard } from './starboard';
import Twitch from './twitch';

export class Bot extends Client {
    public logger: Logger;
    public colors: EmbedColors;
    commands: Collection<string, Command> = new Collection();
    public player: Player;
    public twitch: Twitch;
    public starboard: Starboard;
    private streams: Streams;
    private events: Collection<string, Event> = new Collection;

    public constructor() {
        /*
            Intents:
            FLAGS.Guilds: Required for the bot to work.
            FLAGS.GuildVoiceStates: required for voice state logging, without it, voice state logging will not work
            FLAGS.GuildMessages: required for message logging and starboard, without it, neither will not work
            FLAGS.GuildMessageReactions: required for starboard, without it, starboard will not work
            FLAGS.GuildBans: required for ban logging, without it, ban logging will not work
            FLAGS.MessageContent: required for message logging, without it, message logging will not work

            Partials:
            Message, Channel, Reaction are required for the starboard and message logging to work since the bot might not have the message cached.
         */
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
        this.once('ready', () => {

        });

        // load events
        let eventStart = process.hrtime.bigint();
        const events = await getFiles(`${ __dirname }/../events`);
        let eventCount = 0;
        for (const file of events) {
            const event: Event = await import(file);

            // let botEvent: Event = event as Event;
            // this.events.set(botEvent.name, botEvent);
            // this.on(botEvent.name, botEvent.run.bind(null, this));
            //
            // this.logger.debug(`Loaded event ${ event.name }`);

            if (file.includes('/events/player')) {
                let playerEvent: PlayerEvent = event as PlayerEvent;
                this.player.on(playerEvent.name, playerEvent.run.bind(null, this));
            } else {
                let botEvent: Event = event as Event;
                this.events.set(botEvent.name, botEvent);
                this.on(botEvent.name, botEvent.run.bind(null, this));
            }
            eventCount++;
            this.logger.debug(`Loaded event ${ event.name } for ${ file.includes('/events/player') ? 'player' : 'discordjs' }`);
        }
        let eventResult = process.hrtime.bigint();
        this.logger.info(`Spent ${ ((eventResult - eventStart) / BigInt(1000000)) }ms loading ${ eventCount } events`);

        // load commands
        let commandStart = process.hrtime.bigint();
        const commands = await getFiles(`${ __dirname }/../commands`);
        let commandCount = 0;
        for (const file of commands) {
            // skip sub commands
            if (file.includes('subCommand')) continue;

            const command: Command = await import(file);
            this.commands.set(command.name, command);
            this.on(command.name, command.run.bind(null, this));
            this.logger.debug(`Loaded command /${ command.name }`);
            commandCount++;
        }
        let commandResult = process.hrtime.bigint();
        this.logger.info(`Spent ${ ((commandResult - commandStart) / BigInt(1000000)) }ms loading ${ commandCount } commands`);

        await this.login(process.env.DISCORD_TOKEN);
    }
}
