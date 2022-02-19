import { GuildMember, PermissionString } from 'discord.js'
import { RunFunction } from '../../interfaces/Command'
import { replyMessage } from '../../util/CommonUtils'

export const run: RunFunction = async (client, interaction) => {
    if (!(interaction.member instanceof GuildMember)) return
    const voiceChannel = interaction.member.voice.channel

    // Check to see if user is in voice channel
    if (!voiceChannel) {
        let msg = `❌ You need to be in a voice channel to run this command.`
        return await replyMessage(client, interaction, msg)
    }

    // Check to see if bot has permission to create instant invite
    const permissions = voiceChannel.permissionsFor(client.user)
    if (!permissions.has('CREATE_INSTANT_INVITE')) {
        let msg = `❌ I don't have permission to create an invite in that voice channel.`
        return await replyMessage(client, interaction, msg)
    }

    // Generate activity invite
    let activity = interaction.options.getString('activity')
    client.activity.createTogetherCode(voiceChannel.id, `${activity}`)
        .then(async (invite) => {
            let msg = `Click this link to join the activity in ${voiceChannel.name}: ${invite.code}`
            await replyMessage(client, interaction, msg, false)
        })
}

export const name: string = 'activity'
export const description: string = 'Create an activity in a voice channel'
export const botPermissions: Array<PermissionString> = ['CREATE_INSTANT_INVITE', 'SEND_MESSAGES', 'VIEW_CHANNEL']
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
                value: 'youtube'
            },
            {
                name: 'Poker',
                value: 'poker'
            },
            {
                name: 'Chess',
                value: 'chess'
            },
            {
                name: 'Betrayal',
                value: 'betrayal'
            },
            {
                name: 'Fishing',
                value: 'fishing'
            },
            {
                name: 'Letter Tile',
                value: 'lettertile'
            },
            {
                name: 'Words Snack',
                value: 'wordsnack'
            },
            {
                name: 'Doodle Crew',
                value: 'doodlecrew'
            }
        ]
    }
]
