import { PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { replyBasicEmbed, replyEphemeral } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    const musicChannel = client.cache[interaction.guildId].musicChannel
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        let queue = client.music.getQueue(interaction.guild)

        if (queue) {
            if (queue.songs[1]) {
                let msg = `Skipping ${queue.songs[0].name}...`
                await queue.skip()
                return await replyBasicEmbed(interaction, msg, client.colors.success)
            } else {
                let msg = `Skipping ${queue.songs[0].name}.`
                await queue.stop()
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

export const name: string = 'skip'
export const description: string = 'Skips the current song'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
