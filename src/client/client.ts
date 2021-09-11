import { Client, Intents, Collection, Snowflake } from 'discord.js'
import { Command } from '../interfaces/Command'
import { Config } from '../interfaces/Config'
import { Event } from '../interfaces/Event'
import consola, { Consola } from 'consola'
import StreamMgr from '../util/StreamMgr'
import { promisify } from 'util'
import mongoose from "mongoose"
import _glob from 'glob'
import { Music } from '../util/Music'
import { DiscordTogether } from 'discord-together'

const glob = promisify(_glob)

class Bot extends Client {
    public commands: Collection<string, Command> = new Collection()
    public events: Collection<string, Event> = new Collection()
    public constructor() {
        super({
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
        })}
    public config: Config
    public logger: Consola = consola
    public music: Music
    public activity: DiscordTogether<any>

    public async start(config: Config): Promise<void> {
        consola.info('Chizuru Bot is starting up...')
        this.config = config
        this.login(config.discordToken)
        this.music = new Music(this)
        this.activity = new DiscordTogether(this)

        mongoose.connect(config.mongoURI)
            .then((result: any) => {
                this.logger.success('Connected with Mongoose')
                StreamMgr.run(this)
            }).catch((err: any) => consola.error(err))

        /* Commands */
        const commandFiles: string[] = await glob(`${__dirname}/../commands/**/*{.ts,.js}`)
        commandFiles.map(async (val: string) => {
            const file: Command = await import(val)
            this.commands.set(file.name, file)
        })

        /* Events */
        const eventFiles: string[] = await glob(`${__dirname}/../events/**/*{.ts,.js}`)
        eventFiles.map(async (val: string) => {
            const file: Event = await import(val)
            this.events.set(file.name, file)
            this.on(file.name, file.run.bind(null, this))
            this.channels.resolve
        })
    }
}

export { Bot }
