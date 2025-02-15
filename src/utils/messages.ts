import {
    PrismaClientInitializationError,
    PrismaClientKnownRequestError,
    PrismaClientRustPanicError,
    PrismaClientUnknownRequestError,
    PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    MessageComponentInteraction,
    TextChannel,
} from 'discord.js';
import { Logger } from 'winston';
import { Chizuru } from '../interfaces';
import { Bot } from '../structures/bot';
import { ApiConnectionError, LocateStreamerError, NonTextChannelError } from './errors';

export async function deferReply(interaction: CommandInteraction) {
    return await interaction.deferReply();
}

export async function generateEmbed(data: Chizuru.MessageData): Promise<EmbedBuilder> {
    let embed = new EmbedBuilder();

    if (data.msg) embed.setDescription(data.msg);
    if (data.color) embed.setColor(data.color);
    if (data.footer && data.footerIcon) embed.setFooter({ text: data.footer, iconURL: data.footerIcon });
    if (data.footer && !data.footerIcon) embed.setFooter({ text: data.footer, iconURL: data.footerIcon });
    if (data.timestamp && typeof data.timestamp == 'boolean') embed.setTimestamp();
    if (data.timestamp && typeof data.timestamp == 'string') embed.setTimestamp(new Date(data.timestamp));
    if (data.title) embed.setTitle(data.title);
    if (data.fields) {
        for (let field of data.fields) {
            embed.addFields({
                name: field.name,
                value: field.value,
                inline: field.inline,
            });
        }
    }

    if (data.author && data.authorIcon && !data.authorUrl)
        embed.setAuthor({
            name: data.author,
            iconURL: data.authorIcon,
        });
    if (data.author && !data.authorIcon && !data.authorUrl)
        embed.setAuthor({
            name: data.author,
        });
    if (data.author && data.authorIcon && data.authorUrl)
        embed.setAuthor({
            name: data.author,
            iconURL: data.authorIcon,
            url: data.authorUrl,
        });

    if (data.image) embed.setImage(data.image);
    if (data.titleUrl) embed.setURL(data.titleUrl);

    return embed;
}

export async function replyEmbed(interaction: CommandInteraction, embed: EmbedBuilder) {
    if (interaction.deferred) {
        return await interaction.editReply({ embeds: [embed] });
    } else {
        return await interaction.reply({ embeds: [embed] });
    }
}

export async function replyMessage(interaction: CommandInteraction, message: string, ephemeral?: boolean) {
    if (ephemeral === undefined) ephemeral = true;

    if (interaction.deferred) {
        await interaction.editReply({ content: `${message}` });
    } else {
        await interaction.reply({
            content: `${message}`,
            ephemeral: ephemeral,
        });
    }
}

export async function sendEmbed(channel: TextChannel, embed: EmbedBuilder, message?: string) {
    await channel.send({ content: message, embeds: [embed] });
}

export async function sendEmbedToChannelArr(client: Bot, channels: string[], embed: EmbedBuilder) {
    for (let channelId of channels) {
        let channel = client.channels.resolve(channelId) as TextChannel;
        try {
            await sendEmbed(channel, embed);
        } catch (err) {
            client.logger.error(`${err}`, { label: 'messageUpdate' });
        }
    }
}

export async function replyPages(client: Bot, interaction: CommandInteraction, pages: string[] | EmbedBuilder[]) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('previous').setLabel('Previous').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary)
    );
    let page = 0;
    if (typeof pages[0] === 'string') {
        if (interaction.deferred)
            await interaction.editReply({
                content: pages[0],
                components: [row],
            });
        else await interaction.reply({ content: pages[0], components: [row] });
    } else {
        if (interaction.deferred)
            await interaction.editReply({
                embeds: [pages[0]],
                components: [row],
            });
        else await interaction.reply({ embeds: [pages[0]], components: [row] });
    }

    const filter = (i: any) => i.customId === 'previous' || i.customId === 'next';
    if (!interaction.channel) return;
    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 120000,
    });

    collector.on('collect', async interaction => {
        if (interaction.customId === 'previous') {
            if (page > 0) {
                page--;
            } else {
                page = pages.length - 1;
            }
        } else if (interaction.customId === 'next') {
            if (page + 1 < pages.length) {
                page++;
            } else {
                page = 0;
            }
        }
        await deferUpdate(client, interaction);
        await editPagedReply(client, interaction, pages[page], [row]);
        collector.resetTimer();
    });
}

export async function generateErrorEmbed(err: Error, errorColor: number, logger: Logger): Promise<EmbedBuilder> {
    let message: string;

    switch (err.constructor) {
        case ApiConnectionError:
        case NonTextChannelError:
        case LocateStreamerError:
            message = err.message;
            break;
        case PrismaClientRustPanicError:
            message = 'A bad request was made against the database, please try again later.';
            logger.error(`PrismaClientRustPanicError: ${err}`);
            break;
        case PrismaClientInitializationError:
            message = 'Error connecting to the database, please try again later.';
            logger.error(`PrismaClientInitializationError: ${err}`);
            break;

        case PrismaClientValidationError:
        case PrismaClientUnknownRequestError:
        case PrismaClientKnownRequestError:
            message = 'A bad request was made against the database, please try again later.';
            logger.error(`PrismaClientValidationError: ${err}`);
            break;
        default:
            message = 'default: An unknown error has occurred, please try again later.';
            logger.error(err);
            break;
    }

    return await generateEmbed({
        msg: message,
        color: errorColor,
    });
}

async function deferUpdate(client: Bot, interaction: MessageComponentInteraction) {
    try {
        await interaction.deferUpdate();
    } catch (e) {
        client.logger.error(e);
    }
}

async function editPagedReply(
    client: Bot,
    interaction: MessageComponentInteraction,
    message: string | EmbedBuilder,
    components: ActionRowBuilder<ButtonBuilder>[]
) {
    if (typeof message === 'string') {
        try {
            await interaction.editReply({
                content: message,
                components: components,
            });
        } catch (e) {
            client.logger.error(e);
        }
    } else {
        try {
            await interaction.editReply({
                embeds: [message],
                components: components,
            });
        } catch (e) {
            client.logger.error(e);
        }
    }
}
