import { Events, MessageReaction, PartialMessageReaction } from 'discord.js';
import { Bot } from '../../structures/bot';
import { Event } from '../../structures/event';

export default new Event({
    name: Events.MessageReactionAdd,
    execute: async (client: Bot, reaction: MessageReaction | PartialMessageReaction) => {
        if (reaction.partial) reaction = await reaction.fetch();
        if (!reaction) return;

        let message = reaction.message;
        if (message.partial) message = await message.fetch();

        if (!message) return;
        if (!message.inGuild() || !message.channel.isTextBased()) return;

        await client.starboard.handleReaction(reaction, message);
    },
});
