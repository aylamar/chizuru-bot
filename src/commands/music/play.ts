import { PermissionString, GuildMember } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    if (!(interaction.member instanceof GuildMember)) return
    if (!(interaction.channel.type === 'GUILD_TEXT')) return

    const voiceChannel = interaction.member.voice.channel
    const member = interaction.member
    const textChannel = interaction.channel

    // Play specific permission checks
    if (!voiceChannel) {
        interaction.reply({
            content: `❌ You need to be in a voice channel to run this command.`,
            ephemeral: true,
        })
        return
    }

    const permissions = voiceChannel.permissionsFor(client.user)
    if (!permissions.has('CONNECT')) {
        interaction.reply({
            content: `❌ I don't have permission to join that voice channel.`,
            ephemeral: true,
        })
        return
    }

    if (!permissions.has('SPEAK')) {
        interaction.reply({
            content: `❌ I don't have permission to speak in that voice channel.`,
            ephemeral: true,
        })
        return
    }

    interaction.deferReply()
    let args = interaction.options.getString('song') as string
    await client.music.playVoiceChannel(voiceChannel, args, {
        member,
        textChannel,
    })
    await interaction.deleteReply()
}

export const name: string = 'play'
export const description: string = "Queue music for the voice channel you're connected to"
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
export const options: Array<Object> = [
    {
        name: 'song',
        type: 3,
        description: "Song you'd like to play or search for",
        required: true,
    },
]