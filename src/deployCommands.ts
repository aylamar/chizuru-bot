import { Command } from './interfaces/Command'
import _glob from 'glob'
import { Collection } from 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import * as config from './config.json'

function run() {
    let commands: Collection<string, Command> = new Collection()
    const commandFiles: string[] = _glob.sync(`${__dirname}/./commands/**/*{.ts,.js}`)

    Promise.all(
        commandFiles.map(async (val: string) => {
            const file: Command = await import(val)
            commands.set(file.name, file)
        })
    ).then(() => {
        let rest = new REST({ version: '9' }).setToken(config.discordToken)

        try {
            rest.put(Routes.applicationCommands(config.clientID), {
                body: commands,
            })

            console.log('Successfully registered application commands.')
        } catch (error) {
            console.error(error)
        }
    })
}

run()
