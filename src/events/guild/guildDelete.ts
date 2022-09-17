import { Events, Guild } from 'discord.js';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Event } from '../../structures/event';

export default new Event({
    name: Events.GuildDelete,
    execute: async (client: Bot, guild: Guild) => {
        if (!guild || !guild.id) return;
        try {
            await prisma.guild.delete({ where: { guildId: guild.id } });
            client.logger.error(`Left ${ guild.name } (${ guild.id }), and successfully deleted the records in the database.`, { label: 'event' });
        } catch (err) {
            client.logger.error(`Left ${ guild.name } (${ guild.id }), errored while deleting the records in the database.`, { label: 'event' });
            client.logger.error(err);
        }
    },
});
