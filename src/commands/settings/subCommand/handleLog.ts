import { GuildBasedChannel } from 'discord.js';
import { Bot } from '../../../classes/bot';
import { prisma } from '../../../services';
import { generateEmbed, generateErrorEmbed } from '../../../utils';
import { convertSettingToName, getCurrentChannels, updateArray } from './util';

export async function handleLog(setting: string | null, enabled: boolean | null, channel: GuildBasedChannel | null, client: Bot) {
    if (!setting || !channel || enabled === undefined) {
        return generateEmbed({
            title: 'Settings',
            msg: 'Please provide a setting, a channel, and whether or not the setting should be enabled.',
            color: client.colors.error,
        });
    }

    let settingName = convertSettingToName(setting);
    let currentChannels = await getCurrentChannels(setting, channel.guildId);
    let updatedChannels = await updateArray(currentChannels, channel.id, enabled);

    if (!channel.isTextBased() || channel.isDMBased() || channel.isThread()) {
        return generateEmbed({
            title: 'Settings',
            msg: `${ channel.name } is not a text channel, please select a text channel.`,
            color: client.colors.error,
        });
    }

    try {
        await prisma.guild.upsert({
            where: { guildId: channel.guildId },
            create: { guildId: channel.guildId },
            update: { [setting]: updatedChannels },
        });

        return generateEmbed({
            title: 'Settings',
            color: client.colors.success,
            msg: `${ await settingName } has been ${ enabled ? 'enabled' : 'disabled' } for <#${ channel.id }>`,
        });
    } catch (err: any) {
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }
}
