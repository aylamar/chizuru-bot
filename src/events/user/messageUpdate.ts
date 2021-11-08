import { Message, MessageEmbed } from 'discord.js'
import { Bot } from '../../client/client'
import { RunFunction } from '../../interfaces/Event'
import { getGuild } from '../../util/Guild'

export const run: RunFunction = async (client: Bot, oldMessage: Message, newMessage: Message) => {
    let guildID: string = oldMessage.guildId
    let logChannels: string[] = null

    if (!client.cache[guildID]) {
        let data = await getGuild(guildID)
        client.cache[guildID] = data
        logChannels = data.messageEdit
    } else {
        logChannels = client.cache[guildID].messageEdit
    }
    if (!logChannels) return
    if (!client.cache[guildID].messageDelete) return
    if (client.cache[guildID].logBlacklist?.includes(newMessage.channelId)) return
    if (newMessage.partial) await oldMessage.fetch()
    if (newMessage.author?.bot) return
    if (newMessage.content == oldMessage.content) return

    // Trim oldMessage.content to be 1900 characters or less
    let newMessageTrimmed = newMessage.content
    if (newMessageTrimmed.length > 1900) {
        newMessageTrimmed = newMessageTrimmed.substring(0, 1900)
    }

    // Trim oldMessage.content to be 1900 characters or less
    let oldMessageTrimmed = oldMessage.content
    if (oldMessageTrimmed.length > 1900) {
        oldMessageTrimmed = oldMessageTrimmed.substring(0, 1900)
    }

    logChannels.map((l) => {
        let channel = client.channels.resolve(l)
        if (channel.isText()) {
            let embed = new MessageEmbed()
                .setAuthor(newMessage.author.tag, newMessage.author.avatarURL())
                .setDescription(
                    `<@${newMessage.author.id}> edited a **[message](https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id})** in <#${newMessage.channelId}>\n\n**Old message**\n${oldMessageTrimmed}\n\n**New message**\n${newMessageTrimmed}`
                )
                .setColor(client.colors.warn)
                .setFooter(`User ID: ${newMessage.author.id}`)
                .setTimestamp()

            try {
                channel.send({ embeds: [embed] })
            } catch (err) {
                client.logger.error(err)
            }
            return
        } else {
            return
        }
    })
}

export const name: string = 'messageUpdate'
