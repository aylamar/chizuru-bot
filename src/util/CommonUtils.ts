import { CommandInteraction, MessageEmbed } from 'discord.js'

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