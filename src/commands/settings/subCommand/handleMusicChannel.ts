import { Guild } from '@prisma/client';
import { GuildBasedChannel } from 'discord.js';
import { Bot } from '../../../classes/bot';
import { prisma } from '../../../services';
import { generateEmbed } from '../../../utils';

export async function handleMusicChannel(enabled: boolean | null, channel: GuildBasedChannel | null, guildId: string, client: Bot) {
    if (enabled === null || (!channel && enabled)) {
        return generateEmbed({
            title: 'Settings',
            msg: 'A channel must be provided when locking music commands to a specific channel.',
            color: client.colors.error,
        });
    }

    if (!enabled) {
        await upsertStringSetting(guildId, 'musicChannelId', null);
        return generateEmbed({
            title: 'Settings',
            msg: 'Music commands can now be used in any channel.',
            color: client.colors.success,
        });
    }

    if (!channel || !channel.isTextBased()) {
        return generateEmbed({
            title: 'Settings',
            msg: 'The music channel must be a text channel.',
            color: client.colors.error,
        });
    }
    await upsertStringSetting(guildId, 'musicChannelId', channel.id);

    return generateEmbed({
        title: 'Settings',
        msg: `Music commands can now only be used in ${ channel }`,
        color: client.colors.success,
    });
}

async function upsertStringSetting(guildId: string, setting: keyof Guild, value: string | null) {
    return await prisma.guild.upsert({
        where: { guildId: guildId },
        create: { guildId: guildId },
        update: { [setting]: value },
    });
}
