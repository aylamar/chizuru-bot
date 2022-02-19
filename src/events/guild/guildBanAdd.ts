import { GuildBan, TextChannel } from 'discord.js'
import { RunFunction } from '../../interfaces/Event'
import { getGuildLogBanChannels, sendEmbed } from '../../util/CommonUtils'

export const run: RunFunction = async (client, ban: GuildBan) => {
    let guildID: string = ban.guild.id
    let logChannels = await getGuildLogBanChannels(client, guildID)

    if (!logChannels) return
    if (!client.cache[guildID].logBan) return

    logChannels.map(async (l) => {
        let channel = client.channels.resolve(l) as TextChannel
        if (!channel.isText()) return

        return await sendEmbed(client, channel, {
            author: ban.user.tag,
            authorUrl: ban.user.avatarURL(),
            msg: `<@${ban.user.id}> was banned`,
            timestamp: true,
            color: client.colors.error
        })
    })
}

export const name: string = 'guildBanAdd'
