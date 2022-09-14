import { Chizuru } from '../../interfaces';
import { prisma } from '../../services';
import { Command } from '../../structures/command';
import { generateEmbed, replyEmbed, replyMessage } from '../../utils';

export default new Command({
    name: 'stats',
    description: 'Shows stats about yourself',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['SendMessages'],
    module: Chizuru.CommandModule.Global,
    options: [],

    execute: async (client, interaction) => {
        if (!interaction.inGuild()) return;
        let user = await getUser(interaction.user.id);
        if (!user) return await replyMessage(interaction, 'You are not registered in the database, have you sent any messages before?');

        let rawChannelStats = getRawChannelStats(interaction.user.id, interaction.guildId);
        let totalMessages = getTotalMessages(interaction.user.id);

        let channelStats = await generateChannelStats(await rawChannelStats);

        let serverStats: Chizuru.Field = {
            name: `${ interaction.guild?.name } Message Stats`,
            value: channelStats.message + (channelStats.otherMsgCount > 0 ? `\n\n And ${ channelStats.otherMsgCount } `
                + `${ channelStats.otherMsgCount == 1 ? 'message' : 'messages' } across ${ channelStats.channelCount - 5 } `
                + ` other ${ channelStats.channelCount == 6 ? 'channel' : 'channels' }` : ''),
            inline: false,
        };

        let userStats: Chizuru.Field = {
            name: 'User Stats',
            value: `Tracking since ${ await convertDate(user.created) }\n` + `Total Messages Sent: ${ (await totalMessages) ? await totalMessages : 0 }`,
            inline: true,
        };

        let userInfo: Chizuru.Field = {
            name: 'User Info',
            value: `Username: ${ interaction.user.username }\n` + `Discriminator: ${ interaction.user.discriminator }\n`
                + `Avatar: [Click Here](${ interaction.user.displayAvatarURL() })\n` + `User ID: ${ interaction.user.id }\n`
                + `Create Date: ${ await convertDate(interaction.user.createdAt) }\n`,
            inline: true,
        };

        let embed = generateEmbed({
            title: 'Stats',
            fields: [userInfo, userStats, serverStats],
            color: client.colors.purple,
            author: interaction.user.tag,
            authorIcon: interaction.user.displayAvatarURL(),
        });


        return await replyEmbed(interaction, await embed);
    },
});

async function convertDate(input: Date) {
    let date = new Date(input);
    let year = date.getFullYear();
    let month = date.getMonth() < 9 ? `0${ date.getMonth() + 1 }` : date.getMonth() + 1;
    let day = date.getDate() < 10 ? `0${ date.getDate() }` : date.getDate();
    return `${ year }-${ month }-${ day }`;
}

async function getRawChannelStats(userId: string, guildId: string): Promise<ChannelStats[]> {
    let stats = await prisma.messageStats.groupBy({
        by: ['channelId'],
        _sum: { messageCount: true },
        orderBy: { _sum: { messageCount: 'desc' } },
        where: {
            userId: userId,
            channel: { guildId: guildId },
        },
    });

    // convert to stats to array of { channelId: channelId, messageCount: messageCount }
    return stats.map((item: any) => {
        return { channelId: item.channelId, messageCount: item._sum.messageCount };
    });
}

async function getTotalMessages(userId: string): Promise<number | null> {
    let totalMessages = await prisma.messageStats.aggregate({
        _sum: { messageCount: true },
        where: {
            userId: userId,
        },
    });
    return totalMessages._sum.messageCount;
}

async function getUser(userId: string) {
    return prisma.user.findUnique({
        where: {
            userId: userId,
        }, include: {
            guilds: true,
        },
    });
}


async function generateChannelStats(channelStats: ChannelStats[]): Promise<parsedChannelStats> {
    let data: parsedChannelStats = {
        topMsgCount: 0,
        otherMsgCount: 0,
        channelCount: 0,
        message: '',
    };

    for (let channel of channelStats) {
        if (channel.messageCount === null) continue;
        if (data.channelCount < 5) {
            data.message += `<#${ channel.channelId }> ${ channel.messageCount } messages\n`;
        } else {
            data.otherMsgCount += channel.messageCount;
        }
        data.topMsgCount += channel.messageCount;
        data.channelCount++;
    }
    // remove last \n from data.message
    data.message = data.message.slice(0, -1);
    return data;
}

interface ChannelStats {
    channelId: string,
    messageCount: number
}

interface parsedChannelStats {
    topMsgCount: number,
    otherMsgCount: number,
    channelCount: number,
    message: string,
}
