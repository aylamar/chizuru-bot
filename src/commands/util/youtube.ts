import { PermissionString, MessageEmbed } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import ytSearch from 'yt-search'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let args = interaction.options.getString('title') as string

    const videoSearch = async (query: any) => {
        try {
            const video = await ytSearch(query)
            if (video.videos.length > 1) {
                return video.videos[0]
            } else {
                return null
            }
        } catch (err) {
            client.logger.error(err)
            return null
        }
    }

    const video = await videoSearch(args)
    if (video) {
        await interaction.reply(`${video.url}`)
    } else {
        await interaction.reply({
            content: `❌ Unable to find a video with this name`,
            ephemeral: true,
        })
    }
}

export const name: string = 'youtube'
export const description: string = 'Search for a video on YouTube by title'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
export const options: Array<Object> = [
    {
        name: 'title',
        type: 3,
        description: "Title of the video you'd like to search for",
        required: true,
    },
]
