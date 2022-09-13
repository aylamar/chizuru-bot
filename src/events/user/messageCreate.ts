import { Message } from 'discord.js';
import { Bot } from '../../structures/bot';
import { RunEvent } from '../../interfaces';
import { prisma } from '../../services';

export const run: RunEvent = async (client: Bot, message: Message) => {
    const start = process.hrtime.bigint();
    if (message.author.bot) return;
    if (!message.inGuild()) return

    const guildId = message.guild.id;
    const channelId = message.channel.id;
    const userId = message.author.id;

    try {
        await upsertMessageStat(userId, channelId, guildId);
    } catch (error: any) {
        client.logger.error('Error while upserting message stat', { label: 'event' });
        client.logger.error(error, { label: 'event' });
    }

    const result = process.hrtime.bigint();
    client.logger.debug(`Spent ${ ((result - start) / BigInt(1000000)) }ms processing message create in ${ message.channel.name } by ${ message.author.tag }`, { label: 'event' });
};

export const name = 'messageCreate';

async function upsertMessageStat(userId: string, channelId: string, guildId: string) {
    return await prisma.messageStats.upsert({
        where: {
            channelId_userId: {
                userId: userId,
                channelId: channelId,
            },
        },
        create: {
            user: {
                connectOrCreate: {
                    where: { userId: userId },
                    create: { userId: userId,
                        guilds: {
                            connectOrCreate: {
                                where: { guildId: guildId },
                                create: { guildId: guildId },
                            },
                        }
                    },
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
}