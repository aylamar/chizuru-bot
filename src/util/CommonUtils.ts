import {
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbed
} from 'discord.js'

/*
    Replies to an interaction with the specified message.
    @param interaction The interaction to reply to.
    @param message The message to reply with.
 */
export async function replyEphemeral(interaction: CommandInteraction, message: string) {
    return await interaction.reply({
        content: `${message}`,
        ephemeral: true
    })
}

/*
    Replies to an interaction with the specified message.
    @param interaction The interaction to reply to.
    @param description The text to place in the description field.
    @param color The color of the border of the embed.
 */
export async function replyBasicEmbed(interaction: CommandInteraction, description: string, color: number) {
    let embed = new MessageEmbed()
        .setDescription(`${description}`)
        .setColor(color)
    return await interaction.reply({ embeds: [embed] })
}

/*
    Replies to an interaction with the specified message with pages that can be
    iterated through using buttons on the message.

    @param interaction The interaction to reply to.
    @param pages Array of strings to be used as the different pages.
 */
export async function replyPages(interaction: CommandInteraction, pages: string[]) {
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
        await deferUpdate(i)
        await editReply(i, pages[page], [row])
        collector.resetTimer()
    })
}

/*
    Defers a reply for later usage
    @param interaction The interaction to defer the reply of.
 */
export async function deferReply(interaction: CommandInteraction) {
    return await interaction.deferReply()
}

export async function deferUpdate(interaction: MessageComponentInteraction) {
    return await interaction.deferUpdate()
}

/*
    Edits a reply with the specified message or embed.
    @param interaction The interaction to edit the reply of.
    @param message The message or embed to edit the reply with.
 */
export async function editReply(interaction: CommandInteraction | MessageComponentInteraction, message: string | MessageEmbed, components?: MessageActionRow[]) {
    if (typeof message === 'string') {
        await interaction.editReply({ content: message })
        return
    } else if (components == undefined) {
        await interaction.editReply({ embeds: [message] })
        return
    } else {
        await interaction.editReply({ embeds: [message], components: components })
        return
    }
}