import { PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import fetch from 'node-fetch'
import { replyEmbed, replyMessage } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    try {
        // Get quote from kanye.rest
        let res = await fetch('https://api.kanye.rest')
        let parsed: any = await res.json()

        return await replyEmbed(client, interaction, {
            author: 'Kanye West',
            authorIcon: 'https://i.imgur.com/ywPk81X.jpeg',
            authorUrl: 'https://twitter.com/kanyewest/',
            color: client.colors.success,
            msg: `"${parsed.quote}"`
        })
    } catch (err) {
        let msg = 'Something went wrong, please try again in a few minutes'
        client.logger.error(`Error sending help response in ${interaction.channelId}\n${err}`)
        return await replyMessage(client, interaction, msg)
    }
}

export const name: string = 'kanye'
export const description: string = 'Need some words of wisdom from Kanye?'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
