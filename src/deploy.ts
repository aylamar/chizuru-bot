import 'dotenv/config';
import { Command } from './interfaces';
import { getFiles } from './utils';

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.GUILD_ID;

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

console.log(process.env.DISCORD_CLIENT_ID);

(async () => {
    console.log('Starting up deploy script...');
    const commands = await getFiles(`${ __dirname }/commands`);
    let commandsPayload = [];
    for (const file of commands) {
        if (file.includes('subCommand')) continue;
        const command: Command = await import(file.replace('./build', '..'));
        console.log('Loaded command', command.name);
        commandsPayload.push(command.data.toJSON());
    }

    try {
        console.log('Started refreshing application (/) commands.');

        if (process.env.NODE_ENV != 'production') {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commandsPayload },
            );
            await rest.put(
                Routes.applicationCommands(clientId, guildId),
                { body: [] },
            );

            console.log('Successfully reloaded guild application (/) commands and removed global commands.');
        } else {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: [] },
            );
            await rest.put(
                Routes.applicationCommands(clientId, guildId),
                { body: commandsPayload },
            );

            console.log('Successfully reloaded global application (/) commands and removed guild commands.');
        }
    } catch (error) {
        console.error(error);
    }
})();
