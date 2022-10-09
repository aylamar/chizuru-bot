import { Events, Message } from 'discord.js';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Event } from '../../structures/event';

export default new Event({
    name: Events.MessageCreate,
    execute: async (client: Bot, message: Message) => {
        if (message.author.bot) return;
        if (!message.inGuild()) return;

        await Promise.all([
            checkFilters(client, message),
            upsertMessageStat(client, message.author.id, message.channel.id, message.guild.id, message.guild.ownerId),
        ]);
    },
});

async function checkFilters(client: Bot, message: Message<true>) {
    const guild = await prisma.guild.findUnique({
        where: { id: message.guild.id },
    });
    if (!guild) return;

    if (guild.filteredStrings.length > 0) await checkStrings(client, message, guild.filteredStrings);
    if (guild.filteredExtensions.length > 0) await checkExtensions(client, message, guild.filteredExtensions);
}

async function checkStrings(client: Bot, message: Message<true>, filteredStrings: string[]) {
    const loweredMsg = message.content.toLowerCase();
    for (const string of filteredStrings) {
        if (loweredMsg.includes(string)) return message.delete();
    }
}

async function checkExtensions(client: Bot, message: Message<true>, filteredExtensions: string[]) {
    message.attachments.map(item => {
        if (item.contentType && filteredExtensions.includes(item.contentType)) return message.delete();
    });
}

async function upsertMessageStat(client: Bot, userId: string, channelId: string, guildId: string, ownerId: string) {
    try {
        return await prisma.messageStats.upsert({
            where: {
                channelId_userId: {
                    userId: userId,
                    channelId: channelId,
                },
            },
            create: {
                guildUser: {
                    connectOrCreate: {
                        where: { userId_guildId: { userId: userId, guildId: guildId } },
                        create: {
                            user: {
                                connectOrCreate: {
                                    where: { id: userId },
                                    create: { id: userId },
                                },
                            },
                            guild: {
                                connectOrCreate: {
                                    where: { id: guildId },
                                    create: { id: guildId, ownerId: ownerId },
                                },
                            },
                        },
                    },
                },
                channel: {
                    connectOrCreate: {
                        where: { id: channelId },
                        create: {
                            id: channelId,
                            guild: {
                                connectOrCreate: {
                                    where: { id: guildId },
                                    create: { id: guildId, ownerId: ownerId },
                                },
                            },
                        },
                    },
                },
                messageCount: 1,
            },
            update: {
                messageCount: { increment: 1 },
            },
        });
    } catch (error: any) {
        client.logger.error('Error while checking for filtered strings', {
            label: 'event',
        });
        client.logger.error(error, { label: 'event' });
    }
}
