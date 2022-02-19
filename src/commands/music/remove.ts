import { GuildMember, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { replyEmbed, replyMessage } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    if (!(interaction.member instanceof GuildMember)) return
    if (!(interaction.channel.type === 'GUILD_TEXT')) return

    const queue = client.music.getQueue(interaction.guildId)
    if (!queue) {
        let msg = '❌ Nothing is currently playing on the server.'
        return await replyMessage(client, interaction, msg)
    }

    const voiceChannel = interaction.member.voice.channel
    if (!voiceChannel) {
        let msg = '❌ You must be in a voice channel to use this command'
        return await replyMessage(client, interaction, msg)
    }

    /*
        If there is a queue, ensure that the user is in the same voice channel as the bot when executing the command
     */
    if (queue) {
        if (voiceChannel.id !== queue.voiceChannel.id) {
            let msg = '❌ You must be in the same voice channel as the bot to use this command'
            await replyMessage(client, interaction, msg)
        }
    }

    /*
        Generates and sends embed when removing a song and sends it to the channel
     */
    async function genEmbed(songName: string) {
        let msg = `Removed ${songName} from the queue.`
        return await replyEmbed(client, interaction, { msg: msg, color: client.colors.success })
    }

    let args = interaction.options.getInteger('song') as number
    if (args == 1) {
        let song = queue.songs[0].name
        if (queue.songs[1]) {
            await queue.skip()
        } else {
            await queue.stop()
        }
        await genEmbed(song)
        return

    } else {
        if (queue.songs.length < args) {
            let msg = `❌ The queue only has ${queue.songs.length} songs.`
            return await replyMessage(client, interaction, msg)
        }

        let song: string = queue.songs[args - 1].name
        queue.songs.splice(args - 1, 1)
        await genEmbed(song)
    }
}

export const name: string = 'remove'
export const description: string = 'Removes a song from the queue.'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
export const options: Array<Object> = [
    {
        name: 'song',
        type: 4,
        description: 'Number of the song to remove.',
        required: true
    }
]