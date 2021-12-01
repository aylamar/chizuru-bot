import { RunFunction } from '../../interfaces/Command'
import { MessageEmbed, PermissionString } from 'discord.js'

export const run: RunFunction = async (client, interaction) => {
    const option = interaction.options.getSubcommand()
    let validGuild = client.Starboard.validGuild(interaction.guildId)

    if (validGuild == false && option != 'create') {
        return interaction.reply({
            content: 'You need to create a starboard with "/starboard create" before running this command.',
            ephemeral: true,
        })
    }

    switch (option) {
        case 'ban':
            const bannedUser = interaction.options.getUser('user')
            try {
                let res = await client.Starboard.config.banUser(interaction.guildId, bannedUser.id)
                let banEmbed = new MessageEmbed()
                    .setDescription(res)
                    .setColor(client.colors.success)
                return interaction.reply({embeds: [banEmbed]})
            } catch (err) {
                client.logger.error(err)
                return interaction.reply({
                    content: 'Something went wrong, try again in a few minutes.',
                    ephemeral: true,
                })
            }
        case 'blacklist':
            const blacklistChannel = interaction.options.getChannel('channel')

            if (blacklistChannel.type !== 'GUILD_TEXT') {
                return interaction.reply({
                    content: 'Only text channels can be blacklisted, please select a different channel.',
                    ephemeral: true,
                })
            }

            try {
                let res = await client.Starboard.config.blacklistChannel(interaction.guildId, blacklistChannel.id)
                let blacklistEmbed = new MessageEmbed()
                    .setDescription(res)
                    .setColor(client.colors.success)
                return interaction.reply({embeds: [blacklistEmbed]})
            } catch (err) {
                client.logger.error(err)
                return interaction.reply({
                    content: 'Something went wrong, try again in a few minutes.',
                    ephemeral: true,
                })
            }
        case 'create':
            const starCount = interaction.options.getInteger('starcount')
            const channel = interaction.options.getChannel('channel')
            const emote = interaction.options.getString('emote')

            if (channel.type !== 'GUILD_TEXT') {
                return interaction.reply({
                    content: 'Starboards can only be created for text channels, please select a different channel.',
                    ephemeral: true,
                })
            }

            let res = await client.Starboard.config.create(client, interaction.guildId, channel.id, emote, starCount)
            if (typeof res === 'string') {
                return interaction.reply({ content: res, ephemeral: true})
            } else {
                let createEmbed = new MessageEmbed()
                    .setDescription(`Your starboard channel has been set to <#${channel}> with ${starCount} ${emote}s required to register the message`)
                    .setColor(client.colors.success)
                return interaction.reply({ embeds: [createEmbed] })
            }
        case 'delete':
            try {
                let delRes = await client.Starboard.config.delete(interaction.guildId, client)
                if (delRes) {
                    let delEmbed = new MessageEmbed()
                        .setDescription('The starboard has successfully been deleted.')
                        .setColor(client.colors.success)
                    return interaction.reply({ embeds: [delEmbed] })
                } else {
                    return interaction.reply({
                        content: 'Something went wrong, try again in a few minutes.',
                        ephemeral: true,
                    })
                }
            } catch (err) {
                client.logger.error(err)
                return interaction.reply({
                    content: 'Something went wrong, try again in a few minutes.',
                    ephemeral: true,
                })
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
                type: 4,
            },
            {
                name: 'channel',
                description: 'Channel to send starboard messages to',
                required: true,
                type: 7,
            },
            {
                name: 'emote',
                description:
                    'Name of the emote to count as stars for the starboard',
                required: true,
                type: 3,
            },
        ],
    },
    {
        name: 'delete',
        type: 1,
        description: 'Delete the startboard on this server',
    },
]
