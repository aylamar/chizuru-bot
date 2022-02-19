import { Message, TextChannel } from 'discord.js'
import { Bot } from '../../client/client'
import { RunFunction } from '../../interfaces/Event'
import { getGuildLogMsgEditChannels, sendEmbed } from '../../util/CommonUtils'

export const run: RunFunction = async (client: Bot, oldMessage: Message, newMessage: Message) => {
    let guildID: string = newMessage.guildId
    let logChannels = await getGuildLogMsgEditChannels(client, guildID)

    if (!logChannels) return
    if (!client.cache[guildID].messageDelete) return
    if (client.cache[guildID].logBlacklist?.includes(newMessage.channelId)) return
    if (newMessage.partial) await oldMessage.fetch()
    if (newMessage.author?.bot) return
    if (newMessage.content == oldMessage.content) return

    // Trim newMessage.content to be 1900 characters or fewer due to Discord message limitations
    let newMessageTrimmed = newMessage.content
    if (newMessageTrimmed.length > 1850) {
        newMessageTrimmed = newMessageTrimmed.substring(0, 1850) + '...'
    }

    // Trim oldMessage.content to be 1900 characters or fewer
    let oldMessageTrimmed = oldMessage.content
    if (oldMessageTrimmed.length > 1850) {
        oldMessageTrimmed = oldMessageTrimmed.substring(0, 1850) + '...'
    }

    // Iterate through log channels sending out messages as needed due to Discord message limitations
    logChannels.map(async (l) => {
        let channel = client.channels.resolve(l) as TextChannel

        return await sendEmbed(client, channel, {
            author: newMessage.author.tag,
            authorUrl: newMessage.author.avatarURL(),
            msg: `<@${newMessage.author.id}> edited a **[message](https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id})** in <#${newMessage.channelId}>\n\n**Old message**\n${oldMessageTrimmed}\n\n**New message**\n${newMessageTrimmed}`,
            footer: `User ID: ${newMessage.author.id}`,
            timestamp: true,
            color: client.colors.warn
        })
    })
}

export const name: string = 'messageUpdate'
