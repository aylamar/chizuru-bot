import { PermissionFlagsBits, PermissionsString, SlashCommandBuilder } from 'discord.js';
import { Field, RunCommand } from '../../interfaces';
import { prisma } from '../../services';
import { generateEmbed, replyEmbed, replyMessage } from '../../utils';

export const run: RunCommand = async (client, interaction) => {
    if(!interaction.inGuild()) return
    let user = await prisma.user.findUnique({
        where: {
            userId: interaction.user.id,
        },
        include: {
            guilds: true,
        },
    })
    if(!user) return await replyMessage(interaction, 'You are not registered in the database, have you sent any messages before?')

    let messages = await prisma.messageStats.groupBy({
        by: ['channelId'],
        _sum: { messageCount: true },
        orderBy: { _sum: { messageCount: 'desc' } },
        where: {
            userId: interaction.user.id,
            channel: { guildId: interaction.guildId },
        }
    })

    let totalMessages = await prisma.messageStats.aggregate({
        _sum: { messageCount: true },
        where: {
            userId: interaction.user.id,
        }
    })

    let fields: Field[] = []
    let totalServerMessages = 0

    let messageStats: string = ''
    for(let message of messages) {
        if (message._sum.messageCount === null) continue
        totalServerMessages += message._sum.messageCount
        messageStats += `<#${message.channelId}> ${message._sum.messageCount} messages\n`
    }
    fields.push({
        name: 'Message Stats',
        value: messageStats,
        inline: false
    })
    // convert user.created to yyyy-mm-dd
    let date = new Date(user.created)
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDay()
    let created = `${year}-${month}-${day}`


    let msg = `You have sent a total of ${totalServerMessages} messages in ${interaction.guild?.name} since `
        + `I started tracking your stats on ${ created }, with a total of ${ totalMessages._sum.messageCount} messages sent.`

    let embed = generateEmbed({
        title: 'Stats',
        msg: msg,
        fields: fields,
        color: client.colors.purple,
        author: interaction.user.tag,
        authorIcon: interaction.user.displayAvatarURL(),
    })


    return await replyEmbed(interaction, await embed);
};

export const name: string = 'stats';
export const permissions: PermissionsString[] = ['ViewChannel', 'SendMessages'];

export const data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Shows stats about yourself')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ViewChannel)
    .setDMPermission(false)
