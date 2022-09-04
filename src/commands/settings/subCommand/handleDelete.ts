import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Bot } from '../../../classes/bot';
import { prisma } from '../../../services';
import { generateEmbed, generateErrorEmbed } from '../../../utils';

export async function handleDelete(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, client: Bot): Promise<EmbedBuilder> {
    let deleteChannel = interaction.options.getChannel('channel', true);
    try {
        await prisma.starboard.delete({
            where: {
                channelId: deleteChannel.id,
            },
        });
    } catch (err: any) {
        if (err.code === 'P2025') {
            return generateEmbed({
                title: 'Starboard',
                msg: `No starboard was deleted, a starboard does not exist for <#${ deleteChannel.id }>`,
                color: client.colors.error,
            });
        }
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }

    return generateEmbed({
        title: 'Starboard',
        msg: `Successfully deleted the starboard for <#${ deleteChannel.id }>`,
        color: client.colors.success,
    });
}
