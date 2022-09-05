import { EmbedBuilder, Role } from 'discord.js';
import { Bot } from '../../../classes/bot';
import { prisma } from '../../../services';
import { generateEmbed, generateErrorEmbed } from '../../../utils';

export async function handlePing(setting: string | null, enabled: boolean | null, role: Role | null, guildId: string, client: Bot): Promise<EmbedBuilder> {
    if (enabled === undefined || (enabled === true && !role)) {
        return generateEmbed({
            title: 'Settings',
            msg: 'While enabling stream pings, a role must be selected',
            color: client.colors.error,
        });
    }

    let roleId: string | null = null;
    if (enabled === true && role) roleId = roleId = role.name === '@everyone' ? '@everyone' : role.id;

    try {
        await prisma.guild.upsert({
            where: { guildId: guildId },
            update: { streamPingRoleId: roleId },
            create: { guildId },
        });
    } catch (err: any) {
        return generateErrorEmbed(err, client.colors.error, client.logger);
    }

    return generateEmbed({
        title: 'Settings',
        msg: `Stream pings have been ${ enabled ? `enabled ${ 'for' + role?.name }` : 'disabled' }.`,
        color: client.colors.success,
    });
}
