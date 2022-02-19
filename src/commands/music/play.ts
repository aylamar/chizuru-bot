import { GuildMember, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { deferReply, replyMessage } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    if (!(interaction.member instanceof GuildMember)) return
    if (!(interaction.channel.type === 'GUILD_TEXT')) return

    const musicChannel = client.cache[interaction.guildId].musicChannel
    // Check to see if the server has a defined music channel and ensure command is run in channel if it does
    if (musicChannel === interaction.channelId || musicChannel == undefined) {
        const voiceChannel = interaction.member.voice.channel
        const member = interaction.member
        const textChannel = interaction.channel

        // Check to see if the user is in a voice channel
        if (!voiceChannel) {
            let msg = '❌ You need to be in a voice channel to run this command.'
            return await replyMessage(client, interaction, msg)
        }

        // Ensure that user is in the same voice channel as the bot when queueing music
        const queue = client.music.getQueue(interaction.guildId)
        if (queue) {
            if (voiceChannel.id !== queue.voiceChannel.id) {
                let msg = `❌ You need to be in the same voice channel as the bot to run this command.`
                return await replyMessage(client, interaction, msg)
            }
        }

        // Check to see if the bot has permission to join the channel
        const permissions = voiceChannel.permissionsFor(client.user)
        if (!permissions.has('CONNECT')) {
            let msg = `❌ I don't have permission to join that voice channel.`
            return await replyMessage(client, interaction, msg)
        }

        // Check to see if the bot has permission to speak in the channel
        if (!permissions.has('SPEAK')) {
            let msg = `❌ I don't have permission to speak in that voice channel.`
            return await replyMessage(client, interaction, msg)
        }

        // Defer reply while searching for song
        await deferReply(client, interaction)
        let args = interaction.options.getString('song') as string
        // Search for the song and queue it if found
        await client.music.play(voiceChannel, args, {
            member,
            textChannel
        })
        await interaction.deleteReply()

    } else {
        let msg = `This command can only be run in <#${musicChannel}>.`
        return await replyMessage(client, interaction, msg)
    }
}

export const name: string = 'play'
export const description: string = 'Queue music for the voice channel you\'re connected to'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
export const options: Array<Object> = [
    {
        name: 'song',
        type: 3,
        description: 'Song you\'d like to play or search for',
        required: true
    }
]
