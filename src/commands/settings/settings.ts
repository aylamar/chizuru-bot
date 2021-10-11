import { RunFunction } from '../../interfaces/Command'
import { MessageEmbed, PermissionString } from 'discord.js'
import { getGuild, toggleLookupNSFW, toggleStreamPing } from '../../util/Guild'
import { GuildData } from '../../interfaces/GuildCache'

export const run: RunFunction = async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand()
    switch (subCommand) {
        case 'list':
            if (!client.cache[interaction.guildId]) await getGuild(interaction.guildId)        
            const cache = client.cache[interaction.guildId]
            let embed = new MessageEmbed()
                .setColor(client.colors.purple)

            let msgDel = ''
            if (cache.messageDelete?.length > 0) {
                let delList = cache.messageDelete
                    .map((id) => {return `<#${id}>`})
                    .join(', ')
                    msgDel = `Deleted messages: ${delList}`
            } else {
                msgDel = 'Deleted messages: Not currently logging'
            }

            let msgEdit = ''
            if (cache.messageEdit?.length > 0) {
                let delList = cache.messageEdit
                    .map((id) => {return `<#${id}>`})
                    .join(', ')
                    msgEdit = `Edited messages: ${delList}`
            } else {
                msgEdit = 'Edited messages: Not currently logging'
            }

            embed.addField(`Log Settings`,
                `${msgDel}
                ${msgEdit}`)
       
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
        case 'stream-ping':
            let streamPingSetting = await toggleStreamPing(interaction.guildId, client)
            interaction.reply({ content: `${streamPingSetting}`, ephemeral: true })
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
    /*
    {
        name: 'stream-ping',
        description: 'Toggles on or off @everyone when a stream goes life',
        type: 1,
    },
    */
]

function lookupVal(cache: GuildData) {
    if (cache.lookupNSFW == true) {
        return 'NSFW lookup searches are enabled on this server.'
    } else {
        return 'NSFW lookup searches are not enabled on this server.'
    }
}
