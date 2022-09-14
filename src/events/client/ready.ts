import { Events } from 'discord.js';
import { Event } from '../../structures/event';

export default new Event({
    name: Events.ClientReady,
    execute: async (client) => {
        if (!client.user) return;
        client.logger.info(`${ client.user.tag } is now online!`);
    },
});
