import { Guild } from 'discord.js';
import { Bot } from '../../structures/bot';
import { RunEvent } from '../../interfaces';
import { prisma } from '../../services';

export const run: RunEvent = async (client: Bot, guild: Guild) => {
    if (!guild || !guild.id) return;
    try {
        await prisma.guild.delete({ where: { guildId: guild.id } });
    } catch (err) {
        client.logger.error(`Joined ${ guild.name } (${ guild.id }), errored while deleting a record in the database.`, { label: 'event' });
        client.logger.error(err);
    }
};

export const name: string = 'ready';
