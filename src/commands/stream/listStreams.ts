import { MessageEmbed, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    try {
        let res = await client.Streams.getChannelByGuild(interaction.guildId, client.logger)

        const embed = new MessageEmbed()
            .setTitle("Streams followed on this server:")
            .setColor(client.colors.twitch)
    
        res.map((e: any) => {
            e.followed_channels.map((f: any) => {
                embed.addFields({name: `${f}`, value: `<#${e._id}>`, inline: true})
            })
        })
        await interaction.reply({ embeds: [embed] })
    } catch (err) {
        await interaction.reply({ content: 'Something went wrong, try running this command again.', ephemeral: true })
        client.logger.error(err)
    }
}

export const name: string = 'liststreams'
export const description: string = 'Lists all streams followed in this server'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'MANAGE_MESSAGES']
