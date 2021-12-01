import { GuildBan, MessageEmbed } from 'discord.js'
import { RunFunction } from '../../interfaces/Event'
import { getGuild } from '../../util/Guild'

export const run: RunFunction = async (client, ban: GuildBan) => {
    let guildID: string = ban.guild.id
    let logChannels: string[]

    if (!client.cache[guildID]) {
        let data = await getGuild(guildID)
        client.cache[guildID] = data
        logChannels = data.logBan
    } else {
        logChannels = client.cache[guildID].logBan
    }
    if (!logChannels) return
    if (!client.cache[guildID].logBan) return

    logChannels.map((l) => {
        let channel = client.channels.resolve(l)

        if (channel.isText()) {
            let embed = new MessageEmbed()
                .setAuthor(ban.user.tag, ban.user.avatarURL())
                .setDescription(`<@${ban.user.id}> was unbanned`)
                .setColor(client.colors.error)
                .setTimestamp()
            try {
                channel.send({ embeds: [embed] })
            } catch (err) {
                client.logger.error(err)
            }
        }
        return
    })
}

export const name: string = 'guildBanAdd'
