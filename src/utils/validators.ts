import { ChatInputCommandInteraction } from 'discord.js';
import { Bot } from '../classes/bot';
import { replyMessage } from './messages';

export async function inVoiceChannel(client: Bot, interaction: ChatInputCommandInteraction<'cached'>): Promise<void | true> {
    if (!interaction.member.voice.channelId) {
        return await replyMessage(interaction, 'You must be in a voice channel to use this command.', true);
    }
    return true;
}
