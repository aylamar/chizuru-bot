import { Message } from 'discord.js';
import { Bot } from '../../classes/bot.js';
import { RunEvent } from '../../interfaces';
import { prisma } from '../../services';

export const run: RunEvent = async (client: Bot, message: Message) => {
    const start = process.hrtime.bigint();
    if (message.author.bot) return;

    let hourTimestamp = Date.now() / 1000;
    const guildId = message.guild?.id;
    const channelId = message.channel?.id;
    const userId = message.author?.id;

    if (!guildId || !channelId || !userId) return;
    if (!message.channel.isTextBased() || message.channel.isDMBased()) return;

    await prisma.messageStats.upsert({
        where: {
            hour_channelId_userId: {
                hour: BigInt(hourTimestamp - hourTimestamp % 3600),
                userId: userId,
                channelId: channelId,
            },
        },
        create: {
            hour: BigInt(hourTimestamp - hourTimestamp % 3600),
            user: {
                connectOrCreate: {
                    where: { userId: userId },
                    create: { userId: userId },
                },
            },
            channel: {
                connectOrCreate: {
                    where: { channelId: channelId },
                    create: {
                        channelId: channelId,
                        guild: {
                            connectOrCreate: {
                                where: { guildId: guildId },
                                create: { guildId: guildId },
                            },
                        },
                    },
                },
            },
            messageCount: 1,
        },
        update: { messageCount: { increment: 1 } },
    });

    const result = process.hrtime.bigint();
    client.logger.debug(`Spent ${ ((result - start) / BigInt(1000000)) }ms processing message create in ${ message.channel.name } by ${ message.author.tag }`, { label: 'event' });
};

export const name = 'messageCreate';
