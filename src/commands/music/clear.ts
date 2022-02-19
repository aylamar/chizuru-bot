import { PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { replyEmbed, replyMessage } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    const musicChannel = client.cache[interaction.guildId].musicChannel
    // Check to see if the server has a defined music channel and ensure command is run in channel if it does
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        let queue = client.music.getQueue(interaction.guild)

        // Clear queue if it exists, otherwise tell user nothing is playing
        if (queue) {
            await client.music.stop(interaction.guild)
            let msg = `The current queue has been cleared.`
            return await replyEmbed(client, interaction, { msg: msg, color: client.colors.success })

        } else {
            let msg = `Nothing is currently playing in this server.`
            return await replyEmbed(client, interaction, { msg: msg, color: client.colors.error })
        }
    } else {
        let msg = `This command can only be run in <#${musicChannel}>.`
        return replyMessage(client, interaction, msg)
    }
}

export const name: string = 'clear'
export const description: string = 'Clears the current queue'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
