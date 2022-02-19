import { PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { replyBasicEmbed, replyEphemeral } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    const musicChannel = client.cache[interaction.guildId].musicChannel
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        let queue = client.music.getQueue(interaction.guild)

        if (queue) {
            if (!queue.paused) {
                client.music.pause(interaction.guild)
                let msg = 'Pausing the current song.'
                return await replyBasicEmbed(interaction, msg, client.colors.success)
            } else {
                client.music.resume(interaction.guild)
                let msg = 'Resuming the current song.'
                return await replyBasicEmbed(interaction, msg, client.colors.success)
            }
        } else {
            let msg = 'Nothing is currently playing in this server.'
            return await replyBasicEmbed(interaction, msg, client.colors.error)
        }
    } else {
        let msg = `This command can only be run in <#${musicChannel}>.`
        return await replyEphemeral(interaction, msg)
    }
}

export const name: string = 'pause'
export const description: string = 'Pauses the song that is currently playing'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
