import { prisma } from '../../../services';

export async function convertSettingToName(setting: string): Promise<string> {
    switch (setting) {
        case 'streamPingRandomUser':
            return 'Random user stream pings';
        case 'logBlacklistedChannels':
            return 'Blacklist channel from logging';
        case 'logDeletedMessagesChannels':
            return 'Log deleted messages';
        case 'logEditedMessagesChannels':
            return 'Log edited messages';
        case 'logVoiceStateChannels':
            return 'Log voice status changes';
        default:
            return setting;
    }
}

export async function getCurrentChannels(setting: string, guildId: string): Promise<string[]> {
    const guild = await prisma.guild.findUnique({ where: { guildId } });
    if (!guild) return [];

    switch (setting) {
        case 'logBlacklistedChannels':
            return guild.logBlacklistedChannels;
        case 'logDeletedMessagesChannels':
            return guild.logDeletedMessagesChannels;
        case 'logEditedMessagesChannels':
            return guild.logEditedMessagesChannels;
        case 'logVoiceStateChannels':
            return guild.logVoiceStateChannels;
        default:
            return [];
    }
}
