import { Guild, Starboard } from '@prisma/client';
import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../../classes/bot';
import { Field } from '../../../interfaces';
import { prisma } from '../../../services';
import { generateEmbed } from '../../../utils';

export async function handleList(guildId: string, client: Bot): Promise<EmbedBuilder> {
    let guild = await prisma.guild.findUnique({ where: { guildId }, include: { starboards: true } });
    if (!guild) {
        await prisma.guild.upsert({
            where: { guildId },
            create: { guildId },
            update: { guildId },
            include: { starboards: true },
        });
        return generateEmbed({
            title: 'Settings',
            msg: 'No settings found for this guild, please re-run this command momentarily.',
            color: client.colors.error,
        });
    }

    let fields: Field[] = await generateSettingsFields(guild);
    return generateEmbed({
        title: 'Settings',
        fields: fields,
        color: client.colors.purple,
    });
}

async function generateSettingsFields(guild: (Guild & { starboards: Starboard[] })): Promise<Field[]> {
    let logField: Field = {
        name: 'Log Settings',
        value: `\nLog edited messages: ${ await genChannelList(guild.logEditedMessagesChannels) }`
            + `\nLog deleted messages: ${ await genChannelList(guild.logDeletedMessagesChannels) }`
            + `\nLog voice status changes: ${ await genChannelList(guild.logVoiceStateChannels) }`
            + `\nChannels blacklisted from logging: ${ await genChannelList(guild.logBlacklistedChannels) }`,
        inline: false,
    };

    let musicField: Field = {
        name: 'Music Settings',
        value: `\nMusic commands can be run in ${ guild.musicChannelId ? `<#${ guild.musicChannelId }>` : 'any channel' }`,
        inline: false,
    };

    let role: string;
    if (guild.streamPingRoleId === '@everyone') role = '@everyone';
    else role = `<@&${ guild.streamPingRoleId }>`;

    let streamField: Field = {
        name: 'Stream Settings',
        value: `\nStream pings for random users are ${ guild.streamPingRandomUser ? 'enabled' : 'disabled' }`
            + `\nStream pings for specific roles are ${ guild.streamPingRoleId ? `enabled for ${ role }` : 'disabled' }`,
        inline: false,
    };

    let fields = [logField, musicField, streamField];
    if (guild.starboards.length > 0) {
        // iterate through each starboard
        for (let starboard of guild.starboards) {
            let starboardField: Field = {
                name: 'Starboard Settings',
                value: `Channel: ${ starboard.channelId }`
                    + `\nEmote: ${ starboard.emote }`
                    + `\nRequired ${ starboard.emote }: ${ starboard.emoteCount }`
                    + `\nBanned Users: ${ starboard.bannedUserIds ? starboard.bannedUserIds.map((id) => {
                        return `<@${ id }>`;
                    }).join(', ') : 'None' }`
                    + `\nBlacklisted Channels: ${ starboard.bannedChannelIds ? starboard.bannedChannelIds.map((id) => {
                        return `<#${ id }>`;
                    }).join(', ') : 'None' }`,
                inline: false,
            };
            fields.push(starboardField);
        }
    }
    return fields;
}


async function genChannelList(channels: string[]) {
    if (channels.length > 0) {
        return channels.map((id) => {
            return `<#${ id }>`;
        }).join(', ');
    }
    return `Not logging at the moment`;
}
