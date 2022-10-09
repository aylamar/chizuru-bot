import { Guild } from '@prisma/client';
import { Events, Message } from 'discord.js';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Event } from '../../structures/event';
import { generateEmbed, sendEmbedToChannelArr } from '../../utils';

export default new Event({
    name: Events.MessageUpdate,
    execute: async (client: Bot, oldMessage: Message, newMessage: Message) => {
        if (newMessage.partial) await newMessage.fetch();
        if (oldMessage.partial) await oldMessage.fetch();
        if (!newMessage.inGuild()) return;
        if (newMessage.author?.bot) return;
        if (newMessage.content == oldMessage.content) return;

        let guildId: string = newMessage.guildId;
        let guild: Guild | null;
        try {
            guild = await prisma.guild.findUnique({
                where: { id: guildId },
            });
        } catch (err) {
            client.logger.error(err);
            return;
        }

        if (!guild || guild.logEditedMessagesChannels.length === 0) return;
        if (guild.logBlacklistedChannels.includes(newMessage.channelId)) return;

        // trim messages to be 900 characters or fewer
        let newMsgTrimmed = newMessage.content;
        if (newMsgTrimmed.length > 900) newMsgTrimmed = newMsgTrimmed.substring(0, 900) + '...';

        let oldMsgTrimmed = oldMessage.content;
        if (oldMsgTrimmed.length > 900) oldMsgTrimmed = oldMsgTrimmed.substring(0, 900) + '...';

        let embed = await generateEmbed({
            author: newMessage.author.tag,
            authorIcon: newMessage.author.avatarURL() || newMessage.author.defaultAvatarURL,
            msg:
                `<@${newMessage.author.id}> edited a **[message](https://discord.com/channels/${newMessage.guildId}/` +
                `${newMessage.channelId}/${newMessage.id})** in <#${newMessage.channelId}>` +
                `\n\n**Old message**\n${oldMsgTrimmed}\n\n**New message**\n${newMsgTrimmed}`,
            footer: `User ID: ${newMessage.author.id}`,
            timestamp: true,
            color: client.colors.warn,
        });

        await sendEmbedToChannelArr(client, guild.logEditedMessagesChannels, embed);
    },
});
