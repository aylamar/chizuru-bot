import { Message, TextChannel } from 'discord.js'
import { Bot } from '../../client/client'
import { RunFunction } from '../../interfaces/Event'
import { getGuildLogMsgDeleteChannels, sendEmbed} from '../../util/CommonUtils'
import { Field } from '../../interfaces/MessageData'

export const run: RunFunction = async (client: Bot, message: Message) => {
    let guildID: string = message.guildId
    let logChannels = await getGuildLogMsgDeleteChannels(client, guildID)

    if (!logChannels) return
    if (!client.cache[guildID].messageDelete) return
    if (client.cache[guildID].logBlacklist?.includes(message.channelId)) return
    if (message.partial) return
    if (message.author?.bot) return

    // Trim message.content to be 1900 characters or fewer
    let messageTrimmed = message.content
    if (message.content.length > 1900) {
        messageTrimmed = message.content.substring(0, 1900)
    }

    logChannels.map(async (l) => {
        let channel = client.channels.resolve(l) as TextChannel
        if (channel.isText()) {
            await sendEmbed(client, channel, {
                author: message.author.tag,
                authorIcon: message.author.avatarURL(),
                msg: `Message from <@${message.author.id}> deleted in <#${message.channelId}>\n\n${messageTrimmed}`,
                footer: `User ID: ${message.author.id}`,
                timestamp: true,
                color: client.colors.error
            })

            if (message.attachments.first() !== undefined) {
                await sendEmbed(client, channel, {
                    author: message.author.tag,
                    authorIcon: message.author.avatarURL(),
                    msg: `${message.author.tag}'s message included the following attachments:`,
                    footer: `User ID: ${message.author.id}`,
                    timestamp: true,
                    color: client.colors.error
                })

                let fields: Field[] = []

                message.attachments.forEach((attachment) => {
                    fields.push({
                        name: `Content Type: ${attachment.contentType}`,
                        value: `<${attachment.url}>`,
                        inline: true
                    })
                })

                return await sendEmbed(client, channel, {
                    author: message.author.tag,
                    authorIcon: message.author.avatarURL(),
                    footer: `User ID: ${message.author.id}`,
                    fields,
                    timestamp: true,
                    color: client.colors.error
                })

            }
        } else {
            return
        }
    })
}

export const name: string = 'messageDelete'
