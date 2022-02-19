import { TextChannel, VoiceState } from 'discord.js'
import { RunFunction } from '../../interfaces/Event'
import { getGuildLogVoiceChannels, sendEmbed } from '../../util/CommonUtils'

export const run: RunFunction = async (client, oldState: VoiceState, newState: VoiceState) => {
    let guildID: string = newState.guild.id
    let logChannels = await getGuildLogVoiceChannels(client, guildID)

    if (!logChannels) return
    if (!client.cache[guildID].logVoice) return

    if (newState.selfMute.valueOf() === oldState.selfMute?.valueOf()) return

    logChannels.map(async (l) => {
        let channel = client.channels.resolve(l) as TextChannel

        let curState: string
        if (newState.selfMute.valueOf() === true) {
            curState = 'muted'
        } else {
            curState = 'unmuted'
        }

        return await sendEmbed(client, channel, {
            author: newState.member.user.tag,
            authorIcon: newState.member.user.avatarURL(),
            footer: `User ID: ${newState.member.id}`,
            msg: `${newState.member.user.tag} is now ${curState} in ${newState.channel.name}.`,
            timestamp: true,
            color: client.colors.blurple
        })
    })
}

export const name: string = 'voiceStateUpdate'
