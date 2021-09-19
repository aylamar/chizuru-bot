import { RunFunction } from '../../interfaces/Command'
import { MessageEmbed, PermissionString } from 'discord.js'
import { toggleLookupNSFW } from '../../util/Guild'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return

    const subCommand = interaction.options.getSubcommand()
    switch (subCommand) {
        case 'list':
            const cache = client.cache[interaction.guildId]
            let embed = new MessageEmbed()
                .setColor(client.colors.purple)

            if(cache.logChannel) {
                let log = []
                if(cache.logChannelEdit) log.push('channel edits')
                if(cache.logMessageDelete) log.push('deleted messages')
                if(cache.logMessageEdit) log.push('message edits')
                embed.addField(
                    `Log Settings`,
                    `Currently logging data to: <#${cache.logChannel}>\nThe following is logged: ${log.join(', ')}`
                )
            } else {
                embed.addField('Log Settings', 'No data is currently being logged on this server.')
            }

            if(cache.musicChannel) {
                console.log('Music Settings', `Music commands can only be run in <#${cache.musicChannel}>`)
            } else {
                embed.addField('Music Settings', 'Music commands can be run in any channel on this server.')
            }

            try {
                await interaction.reply({ embeds: [embed] })
            } catch (err) {
                client.logger.error(err)
            }
            break
        case 'lookup':
            let lookupSetting = await toggleLookupNSFW(interaction.guildId, client)
            interaction.reply({ content: `${lookupSetting}`, ephemeral: true })
            break
        }
}


export const name: string = 'settings'
export const description: string = 'View the current settings on the server'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['MANAGE_GUILD']
export const options: Array<any> = [
    {
        name: 'list',
        description: 'List the current server settings',
        type: 1,
    },
    {
        name: 'lookup',
        description: 'Toggles on or off the NSFW setting for this server',
        type: 1,
    }
]
