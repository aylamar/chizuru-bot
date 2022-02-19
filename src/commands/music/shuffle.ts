import { PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { replyBasicEmbed, replyEphemeral } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    const musicChannel = client.cache[interaction.guildId].musicChannel
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        let queue = client.music.getQueue(interaction.guild)

        if (queue) {
            await queue.shuffle()
            let msg = 'The queue has been shuffled.'
            return await replyBasicEmbed(interaction, msg, client.colors.success)
        } else {
            let msg = 'Nothing is currently playing in this server.'
            return await replyBasicEmbed(interaction, msg, client.colors.error)
        }
    } else {
        let msg = `This command can only be run in <#${musicChannel}>.`
        return await replyEphemeral(interaction, msg)
    }
}

export const name: string = 'shuffle'
export const description: string = 'Shuffles the current queue'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
