import { PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { replyEmbed, replyMessage } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    const musicChannel = client.cache[interaction.guildId].musicChannel
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        let queue = client.music.getQueue(interaction.guild)

        if (queue) {
            if (!queue.paused) {
                client.music.pause(interaction.guild)
                let msg = 'Pausing the current song.'
                return await replyEmbed(client, interaction, { msg: msg, color: client.colors.success })
            } else {
                client.music.resume(interaction.guild)
                let msg = 'Resuming the current song.'
                return await replyEmbed(client, interaction, { msg: msg, color: client.colors.success })
            }
        } else {
            let msg = 'Nothing is currently playing in this server.'
            return await replyEmbed(client, interaction, { msg: msg, color: client.colors.error })
        }
    } else {
        let msg = `This command can only be run in <#${musicChannel}>.`
        return await replyMessage(client, interaction, msg)
    }
}

export const name: string = 'pause'
export const description: string = 'Pauses the song that is currently playing'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
