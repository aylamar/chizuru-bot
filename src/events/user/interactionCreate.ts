import { Channel, Events, Interaction } from 'discord.js';
import { Bot } from '../../structures/bot';
import { Event } from '../../structures/event';
import { replyMessage } from '../../utils';

export default new Event({
    name: Events.InteractionCreate,
    execute: async (client: Bot, interaction: Interaction) => {
        if (!interaction.isChatInputCommand() || !client.isReady()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            client.logger.info(`No command found named ${ interaction.commandName }`, { label: 'event' });
            return;
        }

        const channel: Channel | undefined = client.channels.cache.get(interaction.channelId);
        if (!channel || !channel.isTextBased() || channel.isDMBased() || !interaction.inCachedGuild()) return;

        try {
            await command.execute(client, interaction);
        } catch (err) {
            client.logger.error(`Error sending message in ${ interaction.channelId }\n${ err }`, { label: 'event' });
            return await replyMessage(interaction, `❌ Something went wrong, please try again in a few minutes`);
        }
    },
});
