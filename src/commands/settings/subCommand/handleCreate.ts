import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Bot } from '../../../classes/bot';
import { prisma } from '../../../services';
import { generateEmbed, generateErrorEmbed } from '../../../utils';

export async function handleCreate(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, client: Bot): Promise<EmbedBuilder> {
    let createChannel = interaction.options.getChannel('channel', true);
    let emote = interaction.options.getString('emote', true).toLowerCase();
    let count = interaction.options.getInteger('count', true);

    let channel = client.channels.cache.get(createChannel.id);
    if (!channel || !channel.isTextBased() || channel.isDMBased() || channel.isThread() || channel.isVoiceBased()) {
        return generateEmbed({
            title: 'Starboard',
            msg: 'The channel you provided is not a valid channel.',
            color: client.colors.error,
        });
    }

    try {
        await prisma.starboard.create({
            data: {
                guildId: interaction.guildId,
                channelId: channel.id,
                emoteCount: count,
                emote: emote,
            },
        });
    } catch (err: any) {
        // if error is prisma error, then the starboard already exists
        if (err.code === 'P2002') {
            return generateEmbed({
                title: 'Starboard',
                msg: `A starboard already exists for <#${ channel.id }>, you'll need to edit it or delete it.`,
                color: client.colors.error,
            });
        }
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }

    return generateEmbed({
        title: 'Starboard',
        msg: `Successfully created a starboard for <#${ channel.id }> with ${ count } ${ emote }'s.`,
        color: client.colors.success,
    });
}
