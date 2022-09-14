import { Guild } from '@prisma/client';
import { AuditLogEvent, Events, GuildAuditLogs, Message } from 'discord.js';
import { Chizuru } from '../../interfaces';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Event } from '../../structures/event';
import { generateEmbed, sendEmbedToChannelArr } from '../../utils';
import { getRecentAuditLog } from '../../utils/guilds';

export default new Event({
    name: Events.MessageDelete,
    execute: async (client: Bot, message: Message) => {
        if (message.partial) return;
        if (!message.inGuild()) return;
        if (message.author?.bot) return;

        let guildId: string = message.guildId;
        let guild: Guild | null;
        try {
            guild = await prisma.guild.findUnique({ where: { guildId: guildId } });
        } catch (err) {
            client.logger.error(err);
            return;
        }

        if (!guild || guild.logDeletedMessagesChannels.length === 0) return;
        if (guild.logBlacklistedChannels.includes(message.channelId)) return;

        let messageTrimmed = message.content;
        if (message.content.length > 1024) {
            messageTrimmed = message.content.substring(0, 1024) + '...';
        }

        let fetchedLogs: GuildAuditLogs<AuditLogEvent.MessageDelete>;
        try {
            fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MessageDelete,
            });
        } catch (err) {
            client.logger.error(`Failed to fetch audit logs for message delete in guild ${ message.guild.name } (${ message.guildId })`, { label: 'event' });
            client.logger.error(err);
            return;
        }

        let actionBy = getRecentAuditLog(fetchedLogs, message.author.id);
        let fields: Chizuru.Field[] = [];
        if (message.attachments.size > 0) {
            for (let attachment of message.attachments.values()) {
                fields.push({
                    name: `Attached File`,
                    value: `File Name: ${ attachment.name }\n`
                        + `File Size: ${ await formatBytes(attachment.size) }\n`
                        + `Content Type: ${ attachment.contentType }\n`
                        + `File URLs: [Attachment URL](${ attachment.url }), [Proxy URL](${ attachment.proxyURL })`,
                    inline: false,
                });
            }
        }

        let embed = await generateEmbed({
            author: message.author.tag,
            authorIcon: message.author.avatarURL() || message.author.defaultAvatarURL,
            msg: `Message from <@${ message.author.id }> deleted in <#${ message.channelId }>${ await actionBy }\n\n${ messageTrimmed }`,
            footer: `User ID: ${ message.author.id }`,
            fields: fields,
            timestamp: true,
            color: client.colors.error,
        });

        await sendEmbedToChannelArr(client, guild.logDeletedMessagesChannels, embed);
    },
});

async function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
