import { EmbedBuilder, Message, MessageReaction, TextChannel } from 'discord.js';
import { Logger } from 'winston';
import { prisma } from '../services';
import { generateEmbed } from '../utils';
import { Bot } from './bot';

export class Starboard {
    private logger: Logger;
    private client: Bot;

    constructor(client: Bot) {
        this.client = client;
        this.logger = client.logger;
    }

    public async handleReaction(reaction: MessageReaction, message: Message) {
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();
        if (!message.guildId) return;
        let emote = reaction.emoji.name?.toLowerCase();
        if (!emote) return;

        const starboards = await this.findStarboards(message.guildId, emote);
        const author = message.author;
        if (starboards.length === 0) return;

        for (const starboard of starboards) {
            if (starboard.emote.toLowerCase() !== reaction.emoji.name?.toLowerCase()) continue;
            if (starboard.blacklistedChannelIds.includes(message.channelId)) continue;
            if (starboard.blacklistedUserIds.includes(author.id)) continue;

            // count all reactions by userIds that are not blacklisted
            if (reaction.users.cache) await reaction.users.fetch();
            const count = reaction.users.cache.map(user => user.id)
                .filter(userId => !starboard.blacklistedUserIds.includes(userId)).length;
            if (count < starboard.emoteCount) continue;

            const embed = this.generateStarboardEmbed(count, message);
            let channel = this.client.channels.cache.get(starboard.channelId) as TextChannel | undefined;
            if (!channel) {
                // channel not cached, so fetch it
                channel = await this.client.channels.fetch(starboard.channelId) as TextChannel | undefined;
                if (!channel) continue; // channel doesn't exist
            }

            let dbMessage = await prisma.starboardMessage.findUnique({
                where: { starboardId_userMessageId: { starboardId: starboard.id, userMessageId: message.id } },
            });

            let starboardMessage: Message | undefined;
            if (!dbMessage) {
                this.logger.debug(`Creating new starboard message for ${ message.id } in ${ channel.name } for ${ starboard.emote }`, { label: 'starboard' });
                starboardMessage = await channel.send({ embeds: [await embed] });
                await this.updateStarboardMessage(starboard.id, starboardMessage.id, message.id, count);
                continue;
            }
            if (dbMessage.deleted) {
                this.logger.debug(`Starboard message for ${ message.id } in ${ channel.name } for ${ starboard.emote } was deleted, skipping it`, { label: 'starboard' });
                continue;
            }

            try {
                starboardMessage = await channel.messages.fetch(dbMessage.messageId);
            } catch (err) {
                this.logger.info(`Message Id ${ dbMessage.messageId } in #${ starboard.channelId } not found so it is likely deleted, flagging it as deleted in database`, { label: 'starboard' });
                await this.deleteStarboardMessage(starboard.id, message.id);
                continue;
            }
            await starboardMessage.edit({ embeds: [await embed] });
            await this.updateStarboardMessage(starboard.id, starboardMessage.id, message.id, count);
        }
        return;
    }

    private async deleteStarboardMessage(starboardId: number, userMessageId: string) {
        await prisma.starboardMessage.update({
            where: { starboardId_userMessageId: { starboardId: starboardId, userMessageId: userMessageId } },
            data: { deleted: true },
        });
    }

    private async findStarboards(guildId: string, emote: string) {
        return await prisma.starboard.findMany({
            where: {
                AND: [
                    { guildId: guildId },
                    { emote: emote },
                ],
            },
        });
    }

    private async updateStarboardMessage(starboardId: number, starboardMessageId: string, userMessageId: string, count: number) {
        await prisma.starboardMessage.upsert({
            where: { starboardId_userMessageId: { starboardId: starboardId, userMessageId: userMessageId } },
            update: { emoteCount: count },
            create: {
                messageId: starboardMessageId,
                starboardId: starboardId,
                userMessageId: userMessageId,
                emoteCount: count,
            },
        });

    }

    private async generateStarboardEmbed(count: number, message: Message): Promise<EmbedBuilder> {
        let content: string;
        let imageUrl: string | undefined;

        if (message.content.length > 1536) content = message.content.slice(0, 1536);
        else content = message.content;
        content += `\n\n→ [original message](${ message.url }) in <#${ message.channelId }>`;

        if (message.embeds.length) {
            const images = message.embeds
                .filter(embed => embed.thumbnail || embed.image)
                .map(embed => (embed.thumbnail) ? embed.thumbnail.url : embed.image?.url);
            imageUrl = images[0];
        } else if (message.attachments.size) {
            const firstAttachment = message.attachments.first()
            if (firstAttachment) {
                imageUrl = firstAttachment.url;
                content += `\n📎 [${ firstAttachment.name }](${ firstAttachment.url })`;
            }
        }

        return generateEmbed({
            author: message.author.tag,
            authorIcon: message.author.displayAvatarURL(),
            msg: content,
            image: imageUrl,
            color: this.client.colors.purple,
            footer: `${ count } ⭐ (${ message.id }) • ${ message.createdAt.toLocaleDateString() }`,
        });
    }
}
