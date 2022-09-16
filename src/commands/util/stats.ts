import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, Guild } from 'discord.js';
import { Chizuru } from '../../interfaces';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Command } from '../../structures/command';
import { deferReply, generateEmbed, replyEmbed } from '../../utils';

export default new Command({
    name: 'stats',
    description: 'Shows stats about yourself',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['SendMessages'],
    module: Chizuru.CommandModule.Global,
    options: [
        {
            name: 'user',
            description: 'Shows stats about yourself',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'guild',
            description: 'Shows stats about the guild',
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],

    execute: async (client, interaction) => {
        if (!interaction.inCachedGuild()) return;
        let embed: Promise<EmbedBuilder>;
        const subcommand = interaction.options.getSubcommand();
        const defer = deferReply(interaction);

        switch (subcommand) {
            case 'guild':
                embed = handleGuildStats(client, interaction);
                break;
            case 'user':
                embed = handleUserStats(client, interaction);
                break;
            default:
                return;
        }

        await defer;
        return await replyEmbed(interaction, await embed);
    },
});

async function handleGuildStats(client: Bot, interaction: ChatInputCommandInteraction<'cached'>): Promise<EmbedBuilder> {
    const guild = interaction.guild;
    const channelField = generateChannelStats(guild.id);
    const userField = generateUserStats(guild.id);
    const guildStats = generateGuildStats(guild);

    return generateEmbed({
        title: `Stats for ${ guild.name }`,
        color: client.colors.blurple,
        authorIcon: interaction.guild.iconURL() || undefined,
        fields: [await guildStats, await channelField, await userField],
    });
}

async function handleUserStats(client: Bot, interaction: ChatInputCommandInteraction<'cached'>): Promise<EmbedBuilder> {
    const user = await prisma.user.findUnique({
        where: { userId: interaction.user.id }, include: { guilds: true },
    });
    if (!user) return generateEmbed({
        title: 'Error', msg: 'You are not registered in the database', color: client.colors.error,
    });
    let rawChannelStats = getRawChannelStats(interaction.user.id, interaction.guildId);
    let totalMessages = getUserTotalMessages(interaction.user.id);

    let channelStats = await generateUserChannelStats(await rawChannelStats);

    let serverStats: Chizuru.Field = {
        name: `${ interaction.guild?.name } Message Stats`,
        value: channelStats.message + (channelStats.otherMsgCount > 0 ? `\n\n And ${ channelStats.otherMsgCount } ` + `${ channelStats.otherMsgCount == 1 ? 'message' : 'messages' } across ${ channelStats.channelCount - 5 } ` + ` other ${ channelStats.channelCount == 6 ? 'channel' : 'channels' }` : ''),
        inline: false,
    };

    let userStats: Chizuru.Field = {
        name: 'User Stats',
        value: `Tracking since ${ await convertDate(user.created) }\n` + `Total Messages Sent: ${ (await totalMessages) ? await totalMessages : 0 }`,
        inline: true,
    };

    let userInfo: Chizuru.Field = {
        name: 'User Info',
        value: `Username: ${ interaction.user.username }\n` + `Discriminator: ${ interaction.user.discriminator }\n` + `Avatar: [Click Here](${ interaction.user.displayAvatarURL() })\n` + `User ID: ${ interaction.user.id }\n` + `Create Date: ${ await convertDate(interaction.user.createdAt) }\n`,
        inline: true,
    };

    return generateEmbed({
        title: 'Stats',
        fields: [userInfo, userStats, serverStats],
        color: client.colors.purple,
        author: interaction.user.tag,
        authorIcon: interaction.user.displayAvatarURL(),
    });
}

async function convertDate(input: Date) {
    let date = new Date(input);
    let year = date.getFullYear();
    let month = date.getMonth() < 9 ? `0${ date.getMonth() + 1 }` : date.getMonth() + 1;
    let day = date.getDate() < 10 ? `0${ date.getDate() }` : date.getDate();
    return `${ year }-${ month }-${ day }`;
}

async function getRawChannelStats(userId: string, guildId: string): Promise<flatChannel[]> {
    let stats = await prisma.messageStats.groupBy({
        by: ['channelId'], _sum: { messageCount: true }, orderBy: { _sum: { messageCount: 'desc' } }, where: {
            userId: userId, channel: { guildId: guildId },
        },
    });

    // convert to stats to array of { channelId: channelId, messageCount: messageCount }
    return stats.map((item: any) => {
        return { channelId: item.channelId, count: item._sum.messageCount };
    });
}

async function getUserTotalMessages(userId: string): Promise<number | null> {
    let totalMessages = await prisma.messageStats.aggregate({
        _sum: { messageCount: true }, where: {
            userId: userId,
        },
    });
    return totalMessages._sum.messageCount;
}

async function generateGuildStats(guild: Guild): Promise<Chizuru.Field> {
    const messageStats = prisma.messageStats.aggregate({
        where: { channel: { guildId: guild.id } }, _sum: { messageCount: true },
    });

    const totalUsers = prisma.user.aggregate({
        where: { guilds: { some: { guildId: guild.id } } }, _count: { _all: true },
    });

    // get guild creation date
    const creationDate = new Date(guild.createdAt);
    const creationDateStr = `${ creationDate.getFullYear() }-${ pad(creationDate.getMonth() + 1) }-${ pad(creationDate.getDate()) }`;

    return {
        name: 'Guild Stat',
        value: `Guild: ${ creationDateStr }\n` + `Total Messages: ${ (await messageStats)._sum.messageCount }\n` + `Total Users: ${ (await totalUsers)._count._all }\n`,
        inline: true,
    };
}

async function generateChannelStats(guildId: string): Promise<Chizuru.Field> {
    const channels = await prisma.messageStats.groupBy({
        by: ['channelId'], where: { channel: { guildId: guildId } }, _sum: { messageCount: true },
    });

    let flatChannels: flatChannel[];
    flatChannels = channels.map((channel) => {
        return {
            channelId: channel.channelId, count: channel._sum.messageCount ? channel._sum.messageCount : 0,
        };
    });

    // get top 5 channels
    flatChannels.sort((a, b) => b.count - a.count);
    flatChannels = flatChannels.slice(0, 5);

    const channelArr = flatChannels.map((channel) => {
        return `<#${ channel.channelId }>: ${ channel.count } messages`;
    });

    const channelStr = channelArr.join('\n');
    return {
        name: 'Top Channels', value: channelStr.length > 0 ? channelStr : 'No channels found..', inline: true,
    };
}

async function generateUserStats(guildId: string): Promise<Chizuru.Field> {
    const users = await prisma.messageStats.groupBy({
        by: ['userId'], where: { channel: { guildId: guildId } }, _sum: { messageCount: true },
    });

    let flatUsers: flatUser[];
    flatUsers = users.map((user) => {
        return {
            userId: user.userId, count: user._sum.messageCount ? user._sum.messageCount : 0,
        };
    });

    // get top 5 users
    flatUsers.sort((a, b) => b.count - a.count);
    flatUsers = flatUsers.slice(0, 5);

    const userArr = flatUsers.map((user) => {
        return `<@${ user.userId }>: ${ user.count } messages`;
    });

    const userStr = userArr.join('\n');
    return {
        name: 'Top Users', value: userStr.length > 0 ? userStr : 'No users found..', inline: true,
    };
}

async function generateUserChannelStats(channelStats: flatChannel[]): Promise<parsedChannelStats> {
    let data: parsedChannelStats = {
        topMsgCount: 0, otherMsgCount: 0, channelCount: 0, message: '',
    };

    for (let channel of channelStats) {
        if (channel.count === null) continue;
        if (data.channelCount < 5) {
            data.message += `<#${ channel.channelId }> ${ channel.count } messages\n`;
        } else {
            data.otherMsgCount += channel.count;
        }
        data.topMsgCount += channel.count;
        data.channelCount++;
    }
    // remove last \n from data.message
    data.message = data.message.slice(0, -1);
    return data;
}

function pad(num: number): string {
    return num < 10 ? `0${ num }` : `${ num }`;
}

interface flatChannel {
    channelId: string,
    count: number
}

interface flatUser {
    userId: string,
    count: number
}

interface parsedChannelStats {
    topMsgCount: number,
    otherMsgCount: number,
    channelCount: number,
    message: string,
}
