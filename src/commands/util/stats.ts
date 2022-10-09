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
        },
        {
            name: 'bot',
            description: 'Shows stats about the bot',
            type: ApplicationCommandOptionType.Subcommand,
        },
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
            case 'bot':
                embed = handleBotStats(client);
                break;
            default:
                return;
        }

        await defer;
        return await replyEmbed(interaction, await embed);
    },
});

async function handleGuildStats(
    client: Bot,
    interaction: ChatInputCommandInteraction<'cached'>
): Promise<EmbedBuilder> {
    const guild = interaction.guild;
    const channelField = generateChannelStats(guild.id);
    const userField = generateUserStats(guild.id);
    const guildStats = generateGuildStats(guild);

    return generateEmbed({
        title: `Stats for ${guild.name}`,
        color: client.colors.blurple,
        authorIcon: interaction.guild.iconURL() || undefined,
        fields: [await guildStats, await channelField, await userField],
    });
}

async function handleUserStats(client: Bot, interaction: ChatInputCommandInteraction<'cached'>): Promise<EmbedBuilder> {
    const user = await prisma.user.findUnique({
        where: { id: interaction.user.id },
    });
    if (!user)
        return generateEmbed({
            title: 'Error',
            msg: 'You are not registered in the database',
            color: client.colors.error,
        });
    let rawChannelStats = getRawChannelStats(interaction.user.id, interaction.guildId);
    let totalMessages = getUserTotalMessages(interaction.user.id);

    let channelStats = await generateUserChannelStats(await rawChannelStats);

    let serverStats: Chizuru.Field = {
        name: `${interaction.guild?.name} Message Stats`,
        value:
            channelStats.message +
            (channelStats.otherMsgCount !== '0'
                ? `\n\n And ${channelStats.otherMsgCount} ` +
                  `${channelStats.otherMsgCount == '1' ? 'message' : 'messages'} across ${
                      channelStats.channelCount - 5
                  } ` +
                  ` other ${channelStats.channelCount == 6 ? 'channel' : 'channels'}`
                : ''),
        inline: false,
    };

    let userStats: Chizuru.Field = {
        name: 'User Stats',
        value:
            `Tracking since: ${await formatDate(user.created)}\n` +
            `Total Messages Sent: ${(await totalMessages) ? await totalMessages : 0}`,
        inline: true,
    };

    let userInfo: Chizuru.Field = {
        name: 'User Info',
        value:
            `Username: ${interaction.user.username}\n` +
            `Discriminator: ${interaction.user.discriminator}\n` +
            `Avatar: [Click Here](${interaction.user.displayAvatarURL()})\n` +
            `User ID: ${interaction.user.id}\n` +
            `Create Date: ${await formatDate(interaction.user.createdAt)}\n`,
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

async function handleBotStats(client: Bot): Promise<EmbedBuilder> {
    const guilds = prisma.guild.count();
    const users = prisma.user.count();
    const totalMessages = await prisma.messageStats.aggregate({
        _sum: { messageCount: true },
    });
    const oldestMessageCreated = await prisma.messageStats.aggregate({
        _min: { created: true },
    });

    let messagesPerMinute: string = '0.00';
    if (oldestMessageCreated._min.created && totalMessages._sum.messageCount) {
        const minutes = Math.floor((Date.now() - oldestMessageCreated._min.created.getTime()) / 1000 / 60);
        messagesPerMinute = Math.floor(totalMessages._sum.messageCount / minutes).toFixed(2);
    }
    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    return generateEmbed({
        title: `Chizuru v${process.env.npm_package_version}`,
        authorIcon: client.user.displayAvatarURL(),
        msg: `Chizuru Bot is currently in ${await guilds} guilds with ${await users} users that have sent ${addCommas(
            totalMessages._sum.messageCount
        )} messages.`,
        color: client.colors.blurple,
        fields: [
            {
                name: 'Bot',
                value: `Memory Usage: ${used.toFixed(2)} MB\nTotal Commands: ${client.commands.size}\nShards: ${
                    client.shard ? client.shard.count : 0
                }\n`,
                inline: true,
            },
            {
                name: '\u200B',
                value: '\u200B',
                inline: true,
            },
            {
                name: 'Messages',
                value: `Total Messages: ${addCommas(
                    totalMessages._sum.messageCount
                )}\nMessages per Minute: ${messagesPerMinute}/min`,
                inline: true,
            },
            {
                name: 'Uptime',
                value: convertDate(process.uptime()),
                inline: true,
            },
            {
                name: 'Presence',
                value: `${await guilds} Servers\n${addCommas(await users)} Users`,
                inline: true,
            },
            {
                name: 'Author',
                value: 'aylamar\n• [github](https://github.com/aylamar/chizuru-bot)',
                inline: true,
            },
        ],
    });
}

async function formatDate(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth())}-${pad(date.getDate())}`;
}

function convertDate(uptime: number): string {
    // return uptime in days, hours, minutes, seconds
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    // const seconds = Math.floor(uptime % 60);

    return `${days} days\n${hours} hours\n${minutes} minutes`;
}

async function getRawChannelStats(userId: string, guildId: string): Promise<flatChannel[]> {
    let stats = await prisma.messageStats.groupBy({
        by: ['channelId'],
        _sum: { messageCount: true },
        orderBy: { _sum: { messageCount: 'desc' } },
        where: { userId: userId, channel: { guildId: guildId } },
    });

    // convert to stats to array of { channelId: channelId, messageCount: messageCount }
    return stats.map((item: any) => {
        return {
            channelId: item.channelId,
            count: item._sum.messageCount,
            prettyCount: addCommas(item._sum.messageCount),
        };
    });
}

async function getUserTotalMessages(userId: string): Promise<string> {
    let totalMessages = await prisma.messageStats.aggregate({
        _sum: { messageCount: true },
        where: { userId: userId },
    });
    return addCommas(totalMessages._sum.messageCount);
}

async function generateGuildStats(guild: Guild): Promise<Chizuru.Field> {
    const messageStats = prisma.messageStats.aggregate({
        where: { channel: { guildId: guild.id } },
        _sum: { messageCount: true },
    });

    const totalUsers = prisma.guildUser.aggregate({
        where: { guildId: guild.id },
        _count: { _all: true },
    });

    // get guild creation date
    const creationDate = new Date(guild.createdAt);
    const creationDateStr = `${creationDate.getFullYear()}-${pad(creationDate.getMonth() + 1)}-${pad(
        creationDate.getDate()
    )}`;

    return {
        name: 'Guild Stats',
        value:
            `Create Date: ${creationDateStr}\n` +
            `Total Users: ${addCommas((await totalUsers)._count._all)}\n` +
            `Total Messages: ${addCommas((await messageStats)._sum.messageCount)}\n`,
        inline: false,
    };
}

async function generateChannelStats(guildId: string): Promise<Chizuru.Field> {
    const channels = await prisma.messageStats.groupBy({
        by: ['channelId'],
        where: { channel: { guildId: guildId } },
        _sum: { messageCount: true },
    });

    let flatChannels: flatChannel[];
    flatChannels = channels.map(channel => {
        return {
            channelId: channel.channelId,
            count: channel._sum.messageCount ? channel._sum.messageCount : 0,
            prettyCount: addCommas(channel._sum.messageCount ? channel._sum.messageCount : 0),
        };
    });

    // get top 5 channels
    flatChannels.sort((a, b) => b.count - a.count);
    flatChannels = flatChannels.slice(0, 5);

    const channelArr = flatChannels.map(channel => {
        return `<#${channel.channelId}>: ${channel.prettyCount} messages`;
    });

    const channelStr = channelArr.join('\n');
    return {
        name: 'Top Channels',
        value: channelStr.length > 0 ? channelStr : 'No channels found..',
        inline: true,
    };
}

async function generateUserStats(guildId: string): Promise<Chizuru.Field> {
    const users = await prisma.messageStats.groupBy({
        by: ['userId'],
        where: { channel: { guildId: guildId } },
        _sum: { messageCount: true },
    });

    let flatUsers: flatUser[];
    flatUsers = users.map(user => {
        return {
            userId: user.userId,
            count: user._sum.messageCount ? user._sum.messageCount : 0,
            prettyCount: addCommas(user._sum.messageCount ? user._sum.messageCount : 0),
        };
    });

    // get top 5 users
    flatUsers.sort((a, b) => b.count - a.count);
    flatUsers = flatUsers.slice(0, 5);

    const userArr = flatUsers.map(user => {
        return `<@${user.userId}>: ${user.prettyCount} messages`;
    });

    const userStr = userArr.join('\n');
    return {
        name: 'Top Users',
        value: userStr.length > 0 ? userStr : 'No users found..',
        inline: true,
    };
}

async function generateUserChannelStats(channelStats: flatChannel[]): Promise<parsedChannelStats> {
    let data: parsedChannelStats = {
        topMsgCount: 0,
        otherMsgCount: '',
        channelCount: 0,
        message: '',
    };
    let msgCountTmp = 0;

    for (let channel of channelStats) {
        if (channel.count === null) continue;
        if (data.channelCount < 5) {
            data.message += `<#${channel.channelId}> ${channel.count} messages\n`;
        } else {
            msgCountTmp += channel.count;
        }
        data.topMsgCount += channel.count;
        data.channelCount++;
    }
    // remove last \n from data.message
    data.message = data.message.slice(0, -1);
    data.otherMsgCount = addCommas(msgCountTmp);
    return data;
}

function addCommas(number: number | null): string {
    if (!number) return '0';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function pad(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
}

interface flatChannel {
    channelId: string;
    count: number;
    prettyCount: string;
}

interface flatUser {
    userId: string;
    count: number;
    prettyCount: string;
}

interface parsedChannelStats {
    topMsgCount: number;
    otherMsgCount: string;
    channelCount: number;
    message: string;
}
