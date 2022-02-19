import {
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbed,
    TextChannel
} from 'discord.js'
import { getGuild } from './Guild'
import { Bot } from '../client/client'
import { MessageData } from '../interfaces/MessageData'

/*
    The purpose of this file is to provide a set of utility functions that are used throughout the bot.
 */

/*
    Generates an embed message with the specified data.
    If the field is not specified, it will not be included in the embed.
    @param data The data to generate the embed message with.
 */
async function generateEmbed(data: MessageData) {
    let embed = new MessageEmbed()

    if (data.msg) embed.setDescription(data.msg)
    if (data.color) embed.setColor(data.color)
    if (data.footer && data.footerIcon) embed.setFooter({ text: data.footer, iconURL: data.footerIcon })
    if (data.footer && !data.footerIcon) embed.setFooter({ text: data.footer, iconURL: data.footerIcon })
    if (data.timestamp && typeof data.timestamp == 'boolean') embed.setTimestamp()
    if (data.timestamp && typeof data.timestamp == 'string') embed.setTimestamp(new Date(data.timestamp))
    if (data.title) embed.setTitle(data.title)
    if (data.fields) {
        for (let field of data.fields) {
            embed.addField(field.name, field.value, field.inline)
        }
    }

    if (data.author && data.authorIcon && !data.authorUrl) embed.setAuthor({
        name: data.author,
        iconURL: data.authorIcon
    })
    if (data.author && !data.authorIcon && !data.authorUrl) embed.setAuthor({
        name: data.author
    })
    if (data.author && data.authorIcon && data.authorUrl) embed.setAuthor({
        name: data.author,
        iconURL: data.authorIcon
    })

    if (data.image) embed.setImage(data.image)
    if (data.titleUrl) embed.setURL(data.titleUrl)

    return embed
}

/*
    Sends an embed message to the specified channel.
    @param client The bot client.
    @param channel The channel to send the message to.
    @param data The data to generate the embed message with.
 */
export async function sendEmbed(client: Bot, channel: TextChannel, data: MessageData) {
    let embed = await generateEmbed(data)
    try {
        await channel.send({ embeds: [embed] })
    } catch (e) {
        client.logger.error(e)
    }
}

/*
    Replies to an interaction with the specified message.
    @param client The bot client.
    @param interaction The interaction to reply to.
    @param message The message to reply with.
 */
export async function replyMessage(client: Bot, interaction: CommandInteraction, message: string, ephemeral?: boolean) {
    // if no ephemeral value, set to true
    if (ephemeral === undefined) {
        ephemeral = true
    }

    try {
        if (interaction.deferred) {
            await interaction.reply({ content: `${message}` })
        } else {
            await interaction.reply({
                content: `${message}`,
                ephemeral: ephemeral
            })
        }
    } catch (e) {
        client.logger.error(e)
    }
}

/*
    Replies to an interaction with the specified message.
    @param client The bot client.
    @param interaction The interaction to reply to.
    @param data The data to use to construct the message.
 */
export async function replyEmbed(client: Bot, interaction: CommandInteraction, data: MessageData) {
    let embed = await generateEmbed(data)

    try {
        if (interaction.deferred) {
            await interaction.editReply({ embeds: [embed] })
        } else {
            await interaction.reply({ embeds: [embed] })
        }
    } catch (e) {
        client.logger.error(e)
    }
}

/*
    Replies to an interaction with the specified message with pages that can be
    iterated through using buttons on the message.
    @param client The bot client.
    @param interaction The interaction to reply to.
    @param pages Array of strings to be used as the different pages.
 */
export async function replyPages(client: Bot, interaction: CommandInteraction, pages: string[]) {
    const row = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('previous')
            .setLabel('Previous')
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle('PRIMARY')
    )

    let page = 0
    await interaction.reply({ content: pages[0], components: [row] })

    const filter = (i: any) => i.customId === 'previous' || i.customId === 'next'
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 })

    collector.on('collect', async (i) => {
        if (i.customId === 'previous') {
            if (page > 0) {
                page--
            } else {
                page = pages.length - 1
            }
        } else if (i.customId === 'next') {
            if (page + 1 < pages.length) {
                page++
            } else {
                page = 0
            }
        }
        await deferUpdate(client, i)
        await editPagedReply(client, i, pages[page], [row])
        collector.resetTimer()
    })
}

/*
    Defers a reply for later usage
    @param client The bot client.
    @param interaction The interaction to defer the reply of.
 */
export async function deferReply(client: Bot, interaction: CommandInteraction) {
    try {
        await interaction.deferReply()
    } catch (e) {
        client.logger.error(e)
    }
}

/*
    Defers an update for later usage
    @param client The bot client.
    @param interaction The interaction to defer the update of.
 */
export async function deferUpdate(client: Bot, interaction: MessageComponentInteraction) {
    try {
        await interaction.deferUpdate()
    } catch (e) {
        client.logger.error(e)
    }
}

/*
    Edits a reply with the specified message or embed.
    @param client The bot client.
    @param interaction The interaction to edit the reply of.
    @param message The message or embed to edit the reply with.
 */
export async function editPagedReply(client: Bot, interaction: MessageComponentInteraction, message: string | MessageEmbed, components: MessageActionRow[]) {
    if (typeof message === 'string') {
        try {
            await interaction.editReply({ content: message, components: components })
        } catch (e) {
            client.logger.error(e)
        }
    } else {
        try {
            await interaction.editReply({ embeds: [message], components: components })
        } catch (e) {
            client.logger.error(e)
        }
    }
}

/*
    Returns all channels for the specified guild where the bot should send ban updates to.
    @param client The bot client.
    @param guildId The guild to get the channels for.
 */
export async function getGuildLogBanChannels(client: Bot, guildId: string) {
    if (!client.cache[guildId]) {
        let data = await getGuild(guildId)
        client.cache[guildId] = data
        return data.logBan
    } else {
        return client.cache[guildId].logBan
    }
}

/*
    Returns all channels for the specified guild where the bot should send voice updates to.
    @param client The bot client.
    @param guildId The guild to get the channels for.
 */
export async function getGuildLogVoiceChannels(client: Bot, guildId: string) {
    if (!client.cache[guildId]) {
        let data = await getGuild(guildId)
        client.cache[guildId] = data
        return data.logVoice
    } else {
        return client.cache[guildId].logVoice
    }
}

/*
    Returns all channels for the specified guild where the bot should send deleted messages to.
    @param client The bot client.
    @param guildId The guild to get the channels for.
 */
export async function getGuildLogMsgDeleteChannels(client: Bot, guildId: string) {
    if (!client.cache[guildId]) {
        let data = await getGuild(guildId)
        client.cache[guildId] = data
        return data.messageDelete
    } else {
        return client.cache[guildId].messageDelete
    }
}

/*
    Returns all channels for the specified guild where the bot should send edited messages to.
    @param client The bot client.
    @param guildId The guild to get the channels for.
 */
export async function getGuildLogMsgEditChannels(client: Bot, guildId: string) {
    if (!client.cache[guildId]) {
        let data = await getGuild(guildId)
        client.cache[guildId] = data
        return data.messageEdit
    } else {
        return client.cache[guildId].messageEdit
    }
}