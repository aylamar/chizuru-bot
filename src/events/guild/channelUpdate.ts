import { GuildChannel, MessageEmbed } from 'discord.js'
import { Bot } from '../../client/client'
import { RunFunction } from '../../interfaces/Event'
import { getGuild } from '../../util/Guild'

export const run: RunFunction = async (client: Bot, oldChannel: GuildChannel, newChannel: GuildChannel) => {
    if (oldChannel.name === newChannel.name) return
    let guildID: string = oldChannel.guildId
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
        const auditLogFetch = await oldChannel.guild.fetchAuditLogs({
            limit: 1,
            type: 'CHANNEL_UPDATE',
        })
        const entry = auditLogFetch.entries.first()

        let embed = new MessageEmbed()
            .setAuthor(entry.executor.tag, entry.executor.avatarURL())
            .setDescription(`<#${newChannel.id}> was renamed from **#${oldChannel.name}** to **#${newChannel.name}**`)
            .setColor(client.colors.warn)
            .setFooter(`User ID: ${entry.executor.id}`)
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

export const name: string = 'channelUpdate'
