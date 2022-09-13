import { MessageReaction, PartialMessageReaction } from 'discord.js';
import { Bot } from '../../structures/bot';
import { RunEvent } from '../../interfaces';

export const run: RunEvent = async (client: Bot, reaction: MessageReaction | PartialMessageReaction) => {
    const start = process.hrtime.bigint();

    if (reaction.partial) reaction = await reaction.fetch();
    if (!reaction) return

    let message = reaction.message;
    if (message.partial) message = await message.fetch();

    if (!message ) return;
    if (!message.inGuild() || !message.channel.isTextBased()) return;

    await client.starboard.handleReaction(reaction, message);
    const result = process.hrtime.bigint();
    client.logger.debug(`Spent ${ ((result - start) / BigInt(1000000)) }ms processing reaction add in ${ message.channel.name } for ${ reaction.emoji.name }`, { label: 'event' });
};

export const name = 'messageReactionAdd';
