import { noPermission, somethingWrong } from '../../util/CommonReplies'
import { RunFunction } from '../../interfaces/Command'
import { Permissions, MessageEmbed } from 'discord.js'
import ChannelMgr from '../../util/ChannelMgr'
import consola from 'consola'

export const run: RunFunction = async (client, interaction) => {
    if (!interaction.isCommand()) return
    let streamer = interaction.options.getString('streamer')

    if (typeof interaction.member.permissions === "string") {
        await somethingWrong(interaction)
        return
    } else if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
        let res = await ChannelMgr.delStream(streamer, interaction.channelId)
        try {
            switch(res) {
                case "Doesn't Exist":
                    let alreadyExistEmbed = new MessageEmbed()
                        .setDescription(`You won't recieve any notifications for **${streamer}**.`)
                        .setColor(15158332)
                    await interaction.reply({embeds: [alreadyExistEmbed]})
                    break
                case 'Success':
                    let successEmbed = new MessageEmbed()
                        .setDescription(`You'll no longer be notified when **${streamer}** goes online.`)
                        .setColor(15158332)
                    await interaction.reply({embeds: [successEmbed]})
                    break
            }
        } catch (err) {
            consola.error(err)
        }
    } else {
        try {
            await noPermission(interaction)
        } catch (err) {
            consola.error(err)
        }
        return
    }
}

export const name: string = 'delstream'
export const description: string = 'Removes a stream from this channel'
export const options: Array<Object> = [
    {
        name: 'streamer',
        type: 3,
        description: "The username of the streamer you'd like to unfollow",
        required: true,
    },
]
