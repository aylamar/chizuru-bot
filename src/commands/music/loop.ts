import { PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { replyEmbed, replyMessage } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    const musicChannel = client.cache[interaction.guildId].musicChannel
    // Check to see if the server has a defined music channel and ensure command is run in channel if it does
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        let queue = client.music.getQueue(interaction.guild)

        // Loop the queue if it exists, otherwise tell the user there is nothing to loop
        if (queue) {
            if (queue.repeatMode === 0) {
                queue.repeatMode = 2
                let msg = 'Repeating the current queue'
                return await replyEmbed(client, interaction, { msg: msg, color: client.colors.success })
            } else {
                queue.repeatMode = 0
                let msg = 'No longer repeating the queue'
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

export const name: string = 'loop'
export const description: string = 'Loop the current queue'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
