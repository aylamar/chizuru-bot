import { Events, Guild } from 'discord.js';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Event } from '../../structures/event';

export default new Event({
    name: Events.GuildCreate,
    execute: async (client: Bot, guild: Guild) => {
        if (!guild || !guild.id) return;
        try {
            await prisma.guild.upsert({
                where: { id: guild.id },
                create: { id: guild.id, ownerId: guild.ownerId },
                update: { id: guild.id },
            });
            client.logger.info(
                `Joined ${guild.name} (${guild.id}), and successfully created a record in the database.`,
                { label: 'event' }
            );
        } catch (err) {
            client.logger.error(
                `Joined ${guild.name} (${guild.id}), errored while creating a record in the database.`,
                { label: 'event' }
            );
            client.logger.error(err);
        }
    },
});
