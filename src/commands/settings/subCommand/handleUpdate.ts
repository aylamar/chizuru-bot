import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../../classes/bot';
import { prisma } from '../../../services';
import { generateEmbed, generateErrorEmbed } from '../../../utils';
import { convertSettingToName } from './util';

export async function handleUpdate(setting: string | null, enabled: boolean | null, guildId: string, client: Bot): Promise<EmbedBuilder> {
    if (!setting || enabled === undefined) {
        return generateEmbed({
            title: 'Settings',
            msg: 'Please provide a setting and whether or not the setting should be enabled.',
            color: client.colors.error,
        });
    }
    let settingName = convertSettingToName(setting);

    try {
        await prisma.guild.upsert({
            where: { guildId },
            update: { [setting]: enabled },
            create: { guildId },
        });
        return generateEmbed({
            title: 'Settings',
            msg: `${ await settingName } has been set to ${ enabled ? 'enabled' : 'disabled' }.`,
            color: client.colors.success,
        });
    } catch (err: any) {
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }
}
