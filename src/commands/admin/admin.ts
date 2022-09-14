import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { Chizuru } from '../../interfaces';
import { prisma } from '../../services';
import { Bot } from '../../structures/bot';
import { Command } from '../../structures/command';
import { generateEmbed, replyEmbed } from '../../utils';

export default new Command({
    name: 'admin',
    description: 'The admin command',
    isDisabled: false,
    dmPermission: false,
    defaultMemberPermissions: ['ManageGuild'],
    module: Chizuru.CommandModule.Admin,
    options: [
        {
            name: 'stats',
            description: 'Shows the bot\'s stats',
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],

    execute: async (client, interaction) => {
        if (!interaction.inCachedGuild()) return false;
        const subcommand = interaction.options.getSubcommand();
        let embed: Promise<EmbedBuilder>;

        switch (subcommand) {
            case 'stats':
                embed = handleStats(client);
                break;
            default:
                return;
        }

        await replyEmbed(interaction, await embed);
    },
});

async function handleStats(client: Bot): Promise<EmbedBuilder> {
    const guilds = prisma.guild.count();
    const users = prisma.user.count();
    const totalMessages = await prisma.messageStats.aggregate({
        _sum: {
            messageCount: true,
        },
    })
    const oldestMessageCreated = await prisma.messageStats.aggregate({
        _min: {
            created: true
        }
    })

    let messagesPerMinute: string = '0.00';
    if (oldestMessageCreated._min.created && totalMessages._sum.messageCount) {
        const minutes = Math.floor((Date.now() - oldestMessageCreated._min.created.getTime()) / 1000 / 60);
        messagesPerMinute = (Math.floor(totalMessages._sum.messageCount / minutes)).toFixed(2);
    }
    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    return generateEmbed({
        title: `Chizuru v${ process.env.npm_package_version }`,
        msg: `Chizuru Bot is currently in ${ await guilds } guilds with ${ await users } users that have sent ${ totalMessages._sum.messageCount } messages.`,
        color: client.colors.blurple,
        fields: [
            {
                name: 'Author',
                value: 'aylamar\n• [github](https://github.com/aylamar/chizuru-bot)',
                inline: true,
            },
            {
                name: 'Bot',
                value: `Memory: ${used.toFixed(2)} MB\nCommands: ${client.commands.size}\nShards: ${client.shard ? client.shard.count : 0}\n`,
                inline: true,
            },
            {
                name: 'Uptime',
                value: format(process.uptime()),
                inline: true,
            },
            {
                name: 'Presence',
                value: `${ await guilds } Servers\n${ await users } Users`,
                inline: true,
            },
            {
                name: 'Messages',
                value: `${ totalMessages._sum.messageCount } Messages\n(${ messagesPerMinute }/min)`,
                inline: true,
            },
            {
                name: 'Admin Ids',
                value: `${ process.env.LAMAR_ID }`,
                inline: true,
            }
        ]
    });
}

function format(uptime: number): string {
    // return uptime in days, hours, minutes, seconds
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    // const seconds = Math.floor(uptime % 60);

    return `${ days } days\n${ hours } hours\n${ minutes } minutes`;
}
