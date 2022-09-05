import { ChatInputCommandInteraction, GuildTextBasedChannel, NewsChannel, TextChannel } from 'discord.js';
import { Bot } from '../classes/bot';
import { prisma } from '../services';
import { replyMessage } from './messages';

// check to see if the user is in a voice channel when executing a command, replies if not
export async function inVoiceChannel(client: Bot, interaction: ChatInputCommandInteraction<'cached'>): Promise<void | true> {
    if (!interaction.member.voice.channelId) {
        return await replyMessage(interaction, 'You must be in a voice channel to use this command.', true);
    }
    return true;
}

// check to see if the user is in the guild's dedicated music channel when executing a command, replies if not
export async function inMusicCommandChannel(client: Bot, interaction: ChatInputCommandInteraction<'cached'>, channel: TextChannel | NewsChannel) {
    let guild = await prisma.guild.findUnique({
        where: { guildId: interaction.guild.id },
        select: { musicChannelId: true },
    });

    if (guild && guild.musicChannelId !== null && guild.musicChannelId !== channel.id) {
        return await replyMessage(interaction, `Music commands can only be used in the <#${ guild.musicChannelId }>`, true);
    }

    return true;
}

// validate that the channel is a text channel or not
export function isTextChannel(channel: GuildTextBasedChannel | null): NewsChannel | TextChannel | false {
    if (!channel || !channel.isTextBased() || channel.isDMBased() || channel.isThread() || channel.isVoiceBased()) return false;
    return channel;
}

export async function musicValidator(client: Bot, interaction: ChatInputCommandInteraction<'cached'>): Promise<true | void> {
    if (!await inVoiceChannel(client, interaction)) return;
    let channel = isTextChannel(interaction.channel);
    if (!channel) return await replyMessage(interaction, 'You must be in a text channel to use this command.', true);
    if (!await inMusicCommandChannel(client, interaction, channel)) return;
    return true;
}
