import { RunFunction } from '../../interfaces/Command'
import { MessageEmbed, PermissionString } from 'discord.js'
import { toggleLookupNSFW } from '../../util/Guild'
import { GuildData } from '../../interfaces/GuildCache'

export const run: RunFunction = async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand()
    switch (subCommand) {
        case 'list':
            const cache = client.cache[interaction.guildId]
            let embed = new MessageEmbed()
                .setColor(client.colors.purple)

            if (cache.logChannel) {
                let log = []
                if (cache.logChannelEdit) log.push('channel edits')
                if (cache.logMessageDelete) log.push('deleted messages')
                if (cache.logMessageEdit) log.push('message edits')
                embed.addField(`Log Settings`,
                    `Currently logging data to: <#${cache.logChannel}>
                    The following is logged: ${log.join(', ')}`
                )
            } else {
                embed.addField('Log Settings',
                    'No data is currently being logged on this server.'
                )
            }

            if (cache.musicChannel) {
                embed.addField('Music Settings',
                    `Music commands can only be run in <#${cache.musicChannel}>`
                )
            } else {
                embed.addField('Music Settings',
                    'Music commands can be run in any channel on this server.'
                )
            }

            if (!client.Starboard.validGuild(interaction.guildId)) {
                embed.addField('Starboard Settings',
                    'Currently no starboard is setup for this server'
                )
            } else {
                let sbData = await client.Starboard.getConfig(interaction.guildId)
                let bannedUsers, blacklistedChannels = null

                if (sbData.bannedUsers.length > 0) {
                    let userList = sbData.bannedUsers
                        .map((id) => {return `<@${id}>`})
                        .join(', ')
                    bannedUsers = `Banned Users: ${userList}`
                } else {
                    bannedUsers = 'Banned Users: None'
                }

                if (sbData.blacklistedChannels.length > 0) {
                    let userList = sbData.blacklistedChannels
                    .map((id) => {return `<#${id}>`})
                    .join(', ')
                    blacklistedChannels = `Blacklisted Channels: ${userList}`
                } else {
                    blacklistedChannels = 'Blacklisted Channels: None'
                }

                embed.addField('Starboard Settings',
                    `Channel: <#${sbData.starboardChannel}>
                    Emote: ${sbData.starEmote}
                    Required count: ${sbData.starCount}
                    ${bannedUsers}
                    ${blacklistedChannels}`
                )
            }

            let lookupValue = lookupVal(cache)
            embed.addField('Misc Settings', `${lookupValue}`)

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
    },
]

function lookupVal(cache: GuildData) {
    if (cache.lookupNSFW == true) {
        return 'NSFW lookup searches are enabled on this server.'
    } else {
        return 'NSFW lookup searches are not enabled on this server.'
    }
}
