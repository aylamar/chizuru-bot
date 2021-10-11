import { MessageEmbed, VoiceState } from 'discord.js'
import { RunFunction } from '../../interfaces/Event'
import { getGuild } from '../../util/Guild'

export const run: RunFunction = async (client, oldState: VoiceState, newState: VoiceState) => {
    let guildID: string = newState.guild.id
    let logChannels: string[] = null

    if (!client.cache[guildID]) {
        let data = await getGuild(guildID)
        client.cache[guildID] = data
        logChannels = data.logVoice
    } else {
        logChannels = client.cache[guildID].logVoice
    }
    if (!logChannels) return
    if (!client.cache[guildID].logVoice) return

    if (newState.selfMute.valueOf() === oldState.selfMute?.valueOf()) return

    logChannels.map((l) => {
        let channel = client.channels.resolve(l)

        let curState = ''
        if (newState.selfMute.valueOf() === true) {
            curState = 'muted'
        } else {
            curState = 'unmuted'
        }

        if (channel.isText()) {
            let embed = new MessageEmbed()
                .setAuthor(newState.member.user.tag,
                    newState.member.user.avatarURL())
                .setDescription(`${newState.member.user.tag} is now ${curState} in ${newState.channel.name}.`)
                .setColor(client.colors.blurple)
                .setFooter(`User ID: ${newState.member.id}`)
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

export const name: string = 'voiceStateUpdate'
