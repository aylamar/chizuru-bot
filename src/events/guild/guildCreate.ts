import { Guild } from 'discord.js';
import { Bot } from '../../structures/bot';
import { RunEvent } from '../../interfaces';
import { prisma } from '../../services';

export const run: RunEvent = async (client: Bot, guild: Guild) => {
    if (!guild || !guild.id) return;
    try {
        await prisma.guild.upsert({
            where: { guildId: guild.id },
            create: { guildId: guild.id },
            update: { guildId: guild.id },
        });
        client.logger.info(`Joined ${ guild.name } (${ guild.id }), and successfully created a record in the database.`, { label: 'event' });
    } catch (err) {
        client.logger.error(`Joined ${ guild.name } (${ guild.id }), errored while creating a record in the database.`, { label: 'event' });
        client.logger.error(err);
    }
};

export const name: string = 'ready';
