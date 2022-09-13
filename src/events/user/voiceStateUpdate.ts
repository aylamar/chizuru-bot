import { Guild } from '@prisma/client';
import { VoiceState } from 'discord.js';
import { Bot } from '../../structures/bot';
import { RunEvent } from '../../interfaces';
import { prisma } from '../../services';
import { generateEmbed, sendEmbedToChannelArr } from '../../utils';

export const run: RunEvent = async (client: Bot, oldState: VoiceState, newState: VoiceState) => {
    const start = process.hrtime.bigint();
    if (newState.selfMute?.valueOf() === oldState.selfMute?.valueOf()) return;
    if (newState.selfMute === null) return;

    let guild: Guild | null;
    try {
        guild = await prisma.guild.findUnique({ where: { guildId: newState.guild.id } });
    } catch (err) {
        client.logger.error(err);
        return;
    }
    if (!guild || !guild.logVoiceStateChannels) return;
    if (newState.channel === null || newState.member === null) return;
    if (guild.logBlacklistedChannels.includes(newState.channel.id)) return;

    let curState: string;
    if (newState.selfMute.valueOf()) {
        curState = 'muted';
    } else {
        curState = 'unmuted';
    }

    let embed = await generateEmbed({
        author: newState.member.user.tag,
        authorIcon: newState.member.user.avatarURL() || newState.member.user.defaultAvatarURL,
        msg: `${ newState.member.user.tag } is now ${ curState } in ${ newState.channel.name }.`,
        footer: `User ID: ${ newState.member.id }`,
        timestamp: true,
        color: client.colors.blurple,
    });

    await sendEmbedToChannelArr(client, guild.logVoiceStateChannels, embed);
    const result = process.hrtime.bigint();
    client.logger.debug(`Spent ${ ((result - start) / BigInt(1000000)) }ms processing voice update in ${ newState.channel.name } by ${ newState.member.user.tag }`, { label: 'event' });
};

export const name: string = 'voiceStateUpdate';
