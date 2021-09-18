import { Message, MessageEmbed } from 'discord.js'
import { Bot } from '../../client/client'
import { RunFunction } from '../../interfaces/Event'
import { getGuild } from '../../util/Guild'

export const run: RunFunction = async (client: Bot, oldMessage: Message, newMessage: Message) => {
    let guildID: string = oldMessage.guildId
    let logChannel: string = null

    if (!client.cache[guildID]) {
        let data = await getGuild(guildID)
        client.cache[guildID] = data
        logChannel = data.logChannel
    } else {
        logChannel = client.cache[guildID].logChannel
    }
    if (!logChannel) return

    let channel = client.channels.resolve(logChannel)
    if (channel.isText()) {
        let embed = new MessageEmbed()
            .setAuthor(newMessage.author.tag, newMessage.author.avatarURL())
            .setDescription(`<@${newMessage.author.id}> edited a **[message](https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id})** in <#${newMessage.channelId}>\n\n**Old message**\n${oldMessage.content}\n\n**New message**\n${newMessage.content}`)
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
}

export const name: string = 'messageUpdate'
