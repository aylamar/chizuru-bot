import { Events, Message } from 'discord.js';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Event } from '../../structures/event';

export default new Event({
    name: Events.MessageCreate,
    execute: async (client: Bot, message: Message) => {
        if (message.author.bot) return;
        if (!message.inGuild()) return;
        // console.log(message.attachments.map())
        message.attachments.map(item => {
            console.log(item.contentType);
        });

        await Promise.all([
            checkFilters(client, message),
            upsertMessageStat(client, message.author.id, message.channel.id, message.guild.id),
        ]);
    },
});

async function checkFilters(client: Bot, message: Message<true>) {
    const guild = await prisma.guild.findUnique({
        where: { guildId: message.guild.id },
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

async function upsertMessageStat(client: Bot, userId: string, channelId: string, guildId: string) {
    try {
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
    } catch (error: any) {
        client.logger.error('Error while checking for filtered strings', {
            label: 'event',
        });
        client.logger.error(error, { label: 'event' });
    }
}
