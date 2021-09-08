import { Permissions, PermissionString, MessageEmbed } from 'discord.js'
import { noPermission, somethingWrong } from '../../util/CommonReplies'
import { RunFunction } from '../../interfaces/Command'
import ChannelMgr from '../../util/ChannelMgr'
import consola from 'consola'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let streamer = interaction.options.getString('streamer')
  
    if (typeof interaction.member.permissions === "string") {
        await somethingWrong(interaction)
        return
    } else if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
        let res = await ChannelMgr.addStream(streamer, interaction.channelId, interaction.guildId)
        try {
            switch(res) {
                case 'Already Exists':
                    let alreadyExistEmbed = new MessageEmbed()
                        .setDescription(`You already get notifications for **${streamer}** here.`)
                        .setColor(3066993)
                    await interaction.reply({embeds: [alreadyExistEmbed]})
                    break
                case 'Success':
                    let successEmbed = new MessageEmbed()
                        .setDescription(`You'll be notified when **${streamer}** goes online.`)
                        .setColor(3066993)
                    await interaction.reply({embeds: [successEmbed]})
                    break
                case 'Unable to locate':
                    let unableEmbed = new MessageEmbed()
                        .setDescription(`Unable to locate **${streamer}** for some reason, is this the right channel name?`)
                        .setColor(15158332)
                    await interaction.reply({embeds: [unableEmbed]})
                    break
            }
        } catch (err) {
            consola.error(err)
        }
        return
    } else {
        try {
            await noPermission(interaction)
        } catch (err) {
            consola.error(err)
        }
        return
    }
}

export const name: string = 'addstream'
export const description: string = 'Start following a stream in this channel'
export const botPermissions: Array<PermissionString> = ['SEND_MESSAGES', 'VIEW_CHANNEL']
export const options: Array<Object> = [
    {
        name: 'streamer',
        type: 3,
        description: "The username of the streamer you'd like to follow",
        required: true,
    },
]
