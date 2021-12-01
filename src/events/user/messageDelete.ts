import { Message, MessageEmbed } from 'discord.js'
import { Bot } from '../../client/client'
import { RunFunction } from '../../interfaces/Event'
import { getGuild } from '../../util/Guild'

export const run: RunFunction = async (client: Bot, message: Message) => {
    let guildID: string = message.guildId
    let logChannels: string[]

    if (!client.cache[guildID]) {
        let data = await getGuild(guildID)
        client.cache[guildID] = data
        logChannels = data.messageDelete
    } else {
        logChannels = client.cache[guildID].messageDelete
    }
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

    logChannels.map((l) => {
        let channel = client.channels.resolve(l)
        if (channel.isText()) {
            let embed = new MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL())
                .setDescription(`Message from <@${message.author.id}> deleted in <#${message.channelId}>\n\n${messageTrimmed}`)
                .setColor(client.colors.error)
                .setFooter(`User ID: ${message.author.id}`)
                .setTimestamp()

            try {
                channel.send({ embeds: [embed] })
            } catch (err) {
                client.logger.error(err)
            }

            if (message.attachments.first() !== undefined) {
                let imgEmbed = new MessageEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL())
                    .setColor(client.colors.error)
                    .setFooter(`User ID: ${message.author.id}`)
                    .setTimestamp()
                    .setDescription(`${message.author.tag}'s message included the following attachments:`)
                message.attachments.forEach((test) => {
                    imgEmbed.addField(
                        `Content Type: ${test.contentType}`,
                        `<${test.url}>`,
                        true
                    )
                })
                try {
                    channel.send({ embeds: [imgEmbed] })
                } catch (err) {
                    client.logger.error(err)
                }
            }
            return
        } else {
            return
        }
    })
}

export const name: string = 'messageDelete'
