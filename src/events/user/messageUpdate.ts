import { Guild } from '@prisma/client';
import { Message } from 'discord.js';
import { Bot } from '../../classes/bot';
import { RunEvent } from '../../interfaces';
import { prisma } from '../../services';
import { generateEmbed, sendEmbedToChannelArr } from '../../utils';

export const run: RunEvent = async (client: Bot, oldMessage: Message, newMessage: Message) => {
    const start = process.hrtime.bigint();
    if (newMessage.partial) await newMessage.fetch();
    if (oldMessage.partial) await oldMessage.fetch();
    if (!newMessage.inGuild()) return;
    if (newMessage.author?.bot) return;
    if (newMessage.content == oldMessage.content) return;

    let guildId: string = newMessage.guildId;
    let guild: Guild | null;
    try {
        guild = await prisma.guild.findUnique({ where: { guildId: guildId } });
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
        msg: `<@${ newMessage.author.id }> edited a **[message](https://discord.com/channels/${ newMessage.guildId }/`
            + `${ newMessage.channelId }/${ newMessage.id })** in <#${ newMessage.channelId }>`
            + `\n\n**Old message**\n${ oldMsgTrimmed }\n\n**New message**\n${ newMsgTrimmed }`,
        footer: `User ID: ${ newMessage.author.id }`,
        timestamp: true,
        color: client.colors.warn,
    });

    await sendEmbedToChannelArr(client, guild.logEditedMessagesChannels, embed);
    const result = process.hrtime.bigint();
    client.logger.debug(`Spent ${ ((result - start) / BigInt(1000000)) }ms processing message update in ${ newMessage.channel.name } by ${ newMessage.author.tag }`, { label: 'event' });
};

export const name: string = 'messageUpdate';
