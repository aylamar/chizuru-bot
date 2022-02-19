import { PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { replyEmbed, replyMessage } from '../../util/CommonUtils'
import { Field } from '../../interfaces/MessageData'

export const run: RunFunction = async (client, interaction) => {
    try {
        let res = await client.Streams.getChannelByGuild(interaction.guildId, client.logger)

        let fields: Field[] = []
        res.map((e: any) => {
            e.followed_channels.map((f: any) => {
                fields.push({
                    name: `${f}`,
                    value: `<#${e._id}>`,
                    inline: true
                })
            })
        })
        return await replyEmbed(client, interaction, {
            title: 'Streams followed on this server:',
            color: client.colors.twitch,
            fields: fields
        })
    } catch (err) {
        client.logger.error(err)
        let msg = 'Something went wrong, try running this command again'
        return await replyMessage(client, interaction, msg)
    }
}

export const name: string = 'liststreams'
export const description: string = 'Lists all streams followed in this server'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'MANAGE_MESSAGES']
