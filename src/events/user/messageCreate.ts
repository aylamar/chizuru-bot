import { Events, Message } from 'discord.js';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Event } from '../../structures/event';

export default new Event({
    name: Events.MessageCreate,
    execute: async (client: Bot, message: Message) => {
        if (message.author.bot) return;
        if (!message.inGuild()) return;

        const guildId = message.guild.id;
        const channelId = message.channel.id;
        const userId = message.author.id;

        try {
            await upsertMessageStat(userId, channelId, guildId);
        } catch (error: any) {
            client.logger.error('Error while upserting message stat', { label: 'event' });
            client.logger.error(error, { label: 'event' });
        }
    },
});

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
                    create: {
                        userId: userId,
                        guilds: {
                            connectOrCreate: {
                                where: { guildId: guildId },
                                create: { guildId: guildId },
                            },
                        },
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
