import { RunFunction } from '../../interfaces/Command'
import { PermissionString } from 'discord.js'
import { replyEmbed, replyMessage } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    const option = interaction.options.getSubcommand()
    let validGuild = client.Starboard.validGuild(interaction.guildId)

    if (validGuild == false && option != 'create') {
        let msg = 'You need to create a starboard with "/starboard create" before running this command.'
        return await replyMessage(client, interaction, msg)
    }

    switch (option) {
        case 'ban':
            const bannedUser = interaction.options.getUser('user')
            try {
                let msg = await client.Starboard.config.banUser(interaction.guildId, bannedUser.id)
                return await replyEmbed(client, interaction, { msg: msg, color: client.colors.success })
            } catch (err) {
                client.logger.error(err)
                let msg = 'Something went wrong, try again in a few minutes.'
                return await replyMessage(client, interaction, msg)
            }
        case 'blacklist':
            const blacklistChannel = interaction.options.getChannel('channel')

            if (blacklistChannel.type !== 'GUILD_TEXT' && blacklistChannel.type !== 'GUILD_NEWS') {
                let msg = 'Only text channels can be blacklisted, please select a different channel.'
                return await replyMessage(client, interaction, msg)

            }

            try {
                let msg = await client.Starboard.config.blacklistChannel(interaction.guildId, blacklistChannel.id)
                return await replyEmbed(client, interaction, { msg: msg, color: client.colors.success })
            } catch (err) {
                client.logger.error(err)
                let msg = 'Something went wrong, try again in a few minutes.'
                return await replyMessage(client, interaction, msg)
            }
        case 'create':
            const starCount = interaction.options.getInteger('starcount')
            const channel = interaction.options.getChannel('channel')
            const emote = interaction.options.getString('emote')

            if (channel.type !== 'GUILD_TEXT') {
                let msg = 'Starboards can only be created for text channels, please select a different channel.'
                return await replyMessage(client, interaction, msg)
            }

            let res = await client.Starboard.config.create(client, interaction.guildId, channel.id, emote, starCount)
            if (typeof res === 'string') {
                return await replyMessage(client, interaction, res)
            } else {
                let msg = `Your starboard channel has been set to <#${channel}> with ${starCount} ${emote}s required to register the message`
                return await replyEmbed(client, interaction, { msg: msg, color: client.colors.success })
            }
        case 'delete':
            try {
                let delRes = await client.Starboard.config.delete(interaction.guildId, client)
                if (delRes) {
                    let msg = 'The starboard has successfully been deleted.'
                    return await replyEmbed(client, interaction, { msg: msg, color: client.colors.success })
                } else {
                    let msg = 'Something went wrong, try again in a few minutes.'
                    return await replyMessage(client, interaction, msg)
                }
            } catch (err) {
                client.logger.error(err)
                let msg = 'Something went wrong, try again in a few minutes.'
                return await replyMessage(client, interaction, msg)
            }
    }
}

export const name: string = 'starboard'
export const description: string = 'Setup a starboard for this server'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'MANAGE_GUILD']
export const options: Array<any> = [
    {
        name: 'ban',
        type: 1,
        description: 'Ban a user from the starboard, preventing any of their reactions from counting',
        options: [
            {
                name: 'user',
                description: 'The user to ban or unban from the starboard',
                required: true,
                type: 6
            }
        ]
    },
    {
        name: 'blacklist',
        type: 1,
        description: 'Blacklist a channel to prevent messages from appearing in the starboard',
        options: [
            {
                name: 'channel',
                description: 'Channel to blacklist or unblacklist',
                required: true,
                type: 7
            }
        ]
    },
    {
        name: 'create',
        type: 1,
        description: 'Set up a starboard for this server',
        options: [
            {
                name: 'starcount',
                description:
                    'The number of reacts before the message gets sent to the starboard',
                required: true,
                type: 4
            },
            {
                name: 'channel',
                description: 'Channel to send starboard messages to',
                required: true,
                type: 7
            },
            {
                name: 'emote',
                description:
                    'Name of the emote to count as stars for the starboard',
                required: true,
                type: 3
            }
        ]
    },
    {
        name: 'delete',
        type: 1,
        description: 'Delete the startboard on this server'
    }
]
