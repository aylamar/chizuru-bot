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
            throw new Error('Invalid setting.');
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

// adds or removes id from array based on enabled option
export async function updateArray(idArray: string[], id: string, enabled: boolean | null): Promise<string[]> {
    // if item is in list and enabled is false, remove it
    if (idArray.includes(id) && !enabled) {
        idArray.splice(idArray.indexOf(id), 1);
        return idArray;
        // if item is not in array and enabled is true, add it
    } else if (!idArray.includes(id) && enabled) {
        return [...idArray, id];
        // otherwise, do nothing
    } else {
        return idArray;
    }
}
