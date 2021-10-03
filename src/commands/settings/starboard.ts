import { RunFunction } from '../../interfaces/Command'
import { MessageEmbed, PermissionString } from 'discord.js'
import starboard from '../../models/starboard'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    const option = interaction.options.getSubcommand()

    const data = await starboard.findById(interaction.guildId)

    if (data === null && option != 'create') {
        return interaction.reply({
            content: 'You need to create a starboard first before blacklisting channels.',
            ephemeral: true,
        })
    }

    switch (option) {
        case 'ban':
            const bannedUser = interaction.options.getUser('user')
            try {
                if(data.banned_users.includes(bannedUser.id)) {
                    let idx = data.banned_users.indexOf(bannedUser.id)
                    data.banned_users.splice(idx, 1)
                    await data.save()
                    //console.log('hit', data)
                } else {
                    data.banned_users.push(bannedUser.id)
                    await data.save()    
                    //console.log('hit222222', data)
                }
                let res = client.Starboard.config.banUser(interaction.guildId, bannedUser.id)
                let banEmbed = new MessageEmbed()
                    .setDescription(res)
                    .setColor(client.colors.success)
                await interaction.reply({embeds: [banEmbed]})
            } catch (err) {
                client.logger.error(err)
                interaction.reply({
                    content: 'Something went wrong, try again in a few minutes.',
                    ephemeral: true,
                })
            }
            return
        case 'blacklist':
            const blacklistChannel = interaction.options.getChannel('channel')
            try {
                if(data.blacklisted_channels.includes(blacklistChannel.id)) {
                    let idx = data.blacklisted_channels.indexOf(blacklistChannel.id)
                    data.blacklisted_channels.splice(idx, 1)
                    await data.save()
                } else {
                    data.blacklisted_channels.push(blacklistChannel.id)
                    await data.save()    
                }
                let res = client.Starboard.config.blacklistChannel(interaction.guildId, blacklistChannel.id)
                let blacklistEmbed = new MessageEmbed()
                    .setDescription(res)
                    .setColor(client.colors.success)
                await interaction.reply({embeds: [blacklistEmbed]})
            } catch (err) {
                client.logger.error(err)
                interaction.reply({
                    content: 'Something went wrong, try again in a few minutes.',
                    ephemeral: true,
                })
            }
            return
        case 'create':
            const starcount = interaction.options.getInteger('starcount')
            const channel = interaction.options.getChannel('channel')
            const emote = interaction.options.getString('emote')

            if (channel.type !== 'GUILD_TEXT') {
                return interaction.reply({
                    content: 'Starboards can only be created for text channels, please try again.',
                    ephemeral: true,
                })
            }

            try {
                if (data) {
                    interaction.reply({
                        content: 'A starboard has already been created for this server, delete it first to create a new one',
                        ephemeral: true
                    })
                }

                const newStarboard = new starboard({
                    _id: interaction.guildId,
                    star_count: starcount,
                    star_channel: channel.id,
                    star_emote: emote,
                    banned_users: [],
                    blacklisted_channels: [],
                })
                await newStarboard.save()

                client.Starboard.config.add({
                    id: interaction.guildId,
                    options: {
                        starCount: starcount,
                        starboardChannel: channel.id,
                        starEmote: emote,
                        bannedUsers: [],
                        blacklistedChannels: [],
                    },
                })

                interaction.reply({
                    content: `Your starboard channel has been set to <#${channel.id}> with ${starcount} ${emote}s required to register the message.`,
                    ephemeral: true,
                })
            } catch (err) {
                client.logger.error(err)
                interaction.reply({
                    content: 'Something went wrong, try again in a few minutes.',
                    ephemeral: true,
                })
            }
            return
        case 'delete':
            try {
                if (data) data.delete()
                client.Starboard.start(client)
                let delEmbed = new MessageEmbed()
                    .setDescription('The starboard has successfully been deleted.')
                    .setColor(client.colors.success)
                interaction.reply({ embeds: [delEmbed] })
            } catch (err) {
                client.logger.error(err)
                interaction.reply({
                    content: 'Something went wrong, try again in a few minutes.',
                    ephemeral: true,
                })
            }
            return
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
                requred: true,
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
