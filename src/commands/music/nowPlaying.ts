import { PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { replyEmbed, replyMessage } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    const musicChannel = client.cache[interaction.guildId].musicChannel
    // Check to see if the server has a defined music channel and ensure command is run in channel if it does
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        let queue = client.music.getQueue(interaction.guild)

        // If queue exists, send a message containing the current song
        if (queue) {
            const song = queue.songs[0]

            let curTime = await beautifySeconds(queue.currentTime)
            let dur = await beautifySeconds(song.duration)

            let msg = `**[${song.name}](${song.url})** (${curTime}/${dur}) requested by ${song.user}.`
            return await replyEmbed(client, interaction, { msg: msg, color: client.colors.purple })
        } else {
            let msg = 'Nothing is currently playing in this server.'
            return await replyEmbed(client, interaction, { msg: msg, color: client.colors.error })
        }
    } else {
        let msg = `This command can only be run in <#${musicChannel}>.`
        return await replyMessage(client, interaction, msg)
    }
}

export const name: string = 'nowplaying'
export const description: string = 'Show what song is currently playing'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']

async function beautifySeconds(sec: number) {
    let minutes: number
    let seconds: number | string

    minutes = Math.floor(sec / 60)
    seconds = Math.floor(sec % 60)

    if (seconds < 10) {
        seconds = `0${seconds}`
    }

    return `${minutes}:${seconds}`
}
