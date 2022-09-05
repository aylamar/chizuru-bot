import { Guild } from '@prisma/client';
import { AuditLogEvent, GuildAuditLogs, Message } from 'discord.js';
import { Bot } from '../../classes/bot';
import { Field, RunEvent } from '../../interfaces';
import { prisma } from '../../services';
import { generateEmbed, sendEmbedToChannelArr } from '../../utils';
import { getRecentAuditLog } from '../../utils/guilds';

export const run: RunEvent = async (client: Bot, message: Message) => {
    const start = process.hrtime.bigint();
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

    if (!guild || !guild.logDeletedMessagesChannels) return;
    if (guild.logBlacklistedChannels.includes(message.channelId)) return;

    let messageTrimmed = message.content;
    if (message.content.length > 1024) {
        messageTrimmed = message.content.substring(0, 1024) + '...';
    }

    let fetchedLogs:  GuildAuditLogs<AuditLogEvent.MessageDelete>
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
    let fields: Field[] = [];
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
    const result = process.hrtime.bigint();
    client.logger.debug(`Spent ${ ((result - start) / BigInt(1000000)) }ms processing message delete in ${ message.channel.name } by ${ message.author.tag }`, { label: 'event' });
};

export const name: string = 'messageDelete';

async function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
