import { PermissionString, GuildMember } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    if (!(interaction.member instanceof GuildMember)) return
    const voiceChannel = interaction.member.voice.channel

    if (!voiceChannel) {
        interaction.reply({
            content: `❌ You need to be in a voice channel to run this command.`,
            ephemeral: true,
        })
        return
    }

    const permissions = voiceChannel.permissionsFor(client.user)
    if (!permissions.has('CREATE_INSTANT_INVITE')) {
        interaction.reply({
            content: `❌ I don't have permission create an invite in that voice channel.`,
            ephemeral: true,
        })
        return
    }

    let activity = interaction.options.getString('activity')

    client.activity.createTogetherCode(voiceChannel.id, `${activity}`)
        .then(async (invite) => {
            interaction.reply(`${invite.code}`)
        })
}

export const name: string = 'activity'
export const description: string = 'Create an activity in a voice channel'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const userPermissions: Array<PermissionString> = ['SEND_MESSAGES']
export const options: Array<Object> = [
    {
        name: 'activity',
        type: 3,
        description: 'The activity to run in the channel',
        required: true,
        choices: [
            {
                name: 'YouTube',
                value: 'youtube',
            },
            {
                name: 'Poker',
                value: 'poker',
            },
            {
                name: 'Chess',
                value: 'chess',
            },
            {
                name: 'Betrayal',
                value: 'betrayal',
            },
            {
                name: 'Fishing',
                value: 'fishing',
            },
        ],
    },
]
