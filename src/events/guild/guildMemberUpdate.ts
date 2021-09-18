import { GuildMember, MessageEmbed } from 'discord.js'
import { Bot } from '../../client/client'
import { RunFunction } from '../../interfaces/Event'
import { getGuild } from '../../util/Guild'

export const run: RunFunction = async (client: Bot, oldMember: GuildMember, newMember: GuildMember) => {
    // Don't log anything if the user's username did not change
    if(oldMember.user.tag === newMember.user.tag) return

    let guildID: string = oldMember.guild.id
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
            .setAuthor(newMember.user.tag, newMember.user.avatarURL())
            .setDescription(`<@${newMember.user.id}> changed their username from ${oldMember.user.tag} to ${newMember.user.tag}`)
            .setColor(client.colors.warn)
            .setFooter(`User ID: ${newMember.user.id}`)
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

export const name: string = 'guildMemberUpdate'
