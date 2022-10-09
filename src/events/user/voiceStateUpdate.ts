import { Guild } from '@prisma/client';
import { Events, VoiceState } from 'discord.js';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Event } from '../../structures/event';
import { generateEmbed, sendEmbedToChannelArr } from '../../utils';

export default new Event({
    name: Events.VoiceStateUpdate,
    execute: async (client: Bot, oldState: VoiceState, newState: VoiceState) => {
        if (newState.selfMute?.valueOf() === oldState.selfMute?.valueOf()) return;
        if (newState.selfMute === null) return;

        let guild: Guild | null;
        try {
            guild = await prisma.guild.findUnique({
                where: { id: newState.guild.id },
            });
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
            msg: `${newState.member.user.tag} is now ${curState} in ${newState.channel.name}.`,
            footer: `User ID: ${newState.member.id}`,
            timestamp: true,
            color: client.colors.blurple,
        });

        await sendEmbedToChannelArr(client, guild.logVoiceStateChannels, embed);
    },
});
