import { Channel, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Bot } from '../../../classes/bot';
import { prisma } from '../../../services';
import { generateEmbed, generateErrorEmbed, NoStarboardError } from '../../../utils';
import { convertStarboardSettings, getStarboardIds, updateArray } from './util';

export async function handleBlacklist(option: string, interaction: ChatInputCommandInteraction<'cached' | 'raw'>, client: Bot): Promise<EmbedBuilder> {
    let starboard = interaction.options.getChannel('channel', true);
    let blacklistChannel = interaction.options.getChannel('blacklist-channel');
    if (blacklistChannel) {
        // convert APIInteractionDataResolvedChannel to channel
        let apiChannel: Channel | undefined | null = client.channels.cache.get(blacklistChannel.id);
        apiChannel = apiChannel ?? await client.channels.fetch(blacklistChannel.id);
        if (!apiChannel || !apiChannel.isTextBased() || apiChannel.isDMBased()) {
            return generateEmbed({
                title: 'Starboard',
                msg: 'Please provide a valid text channel.',
                color: client.colors.error,
            });
        }
    }
    let blacklistUser = interaction.options.getUser('user');
    let blacklisted = interaction.options.getBoolean('blacklisted', true);
    let id = blacklistChannel ? blacklistChannel.id : blacklistUser?.id;
    if (!id) return generateEmbed({
        title: 'Starboard',
        msg: 'Please provide a valid channel or user.',
        color: client.colors.error,
    });

    let currentIds: string[];
    try {
        currentIds = await getStarboardIds(option, starboard.id);
    } catch (err: any) {
        if (err instanceof NoStarboardError) {
            return generateEmbed({
                title: 'Starboard',
                msg: err.message,
                color: client.colors.error,
            });
        }
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }

    const updatedIds = updateArray(currentIds, id, blacklisted);
    const setting = convertStarboardSettings(option);

    await prisma.starboard.update({
        where: { channelId: starboard.id },
        data: { [await setting]: await updatedIds },
    });

    let idString: string;
    if (blacklistUser) {
        idString = `<@${ blacklistUser.id }>`;
    } else if (blacklistChannel) {
        idString = `<#${ blacklistChannel.id }>`;
    } else {
        idString = 'Invalid';
    }

    return generateEmbed({
        title: 'Starboard',
        color: client.colors.success,
        msg: `Successfully ${ blacklisted ? 'added' : 'removed' } ${ option } ${ idString } from the <#${ starboard.id }> Starboard blacklist.`,
    });
}
