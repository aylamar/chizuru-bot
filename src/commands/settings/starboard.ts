import { RunFunction } from '../../interfaces/Command'
import { MessageEmbed, PermissionString } from 'discord.js'
import starboard from '../../models/starboard'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    const option = interaction.options.getSubcommand()

    if (option === 'delete') {
        try {
            const data = await starboard.findById(interaction.guildId)
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
    } else if (option === 'create') {
        const starcount = interaction.options.getInteger('starcount')
        const channel = interaction.options.getChannel('channel')
        const emote = interaction.options.getString('emote')

        if (channel.type !== 'GUILD_TEXT') {
            return interaction.reply({
                content: 'Please try again with a text channel.',
                ephemeral: true,
            })
        }

        try {
            const data = await starboard.findById(interaction.guildId)
            if (data) data.delete()
            const newStarboard = new starboard({
                _id: interaction.guildId,
                star_count: starcount,
                star_channel: channel.id,
                star_emote: emote,
            })
            await newStarboard.save()

            client.Starboard.config.guilds.add({
                id: interaction.guildId,
                options: {
                    starCount: starcount,
                    starboardChannel: channel.id,
                    starEmote: emote,
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
    }
}

export const name: string = 'starboard'
export const description: string = 'Setup a starboard for this server'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'MANAGE_GUILD']
export const options: Array<any> = [
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
