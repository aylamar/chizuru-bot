import Discord, { Interaction, Permissions } from 'discord.js'
import ChannelMgr from '../util/ChannelMgr'
import { noPermission, somethingWrong } from '../util/CommonReplies'

async function delStream(streamer: string, interaction: Interaction) {
    // Needed for the ability to reply
    if (!interaction.isCommand()) return;

    if (typeof interaction.member.permissions === "string") {
        await somethingWrong(interaction)
        return
    } else if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
        let res = await ChannelMgr.delStream(streamer, interaction.channelId)
        switch(res) {
            case "Doesn't Exist":
                let alreadyExistEmbed = new Discord.MessageEmbed()
                    .setDescription(`You won't recieve any notifications for **${streamer}**.`)
                    .setColor(15158332)
                await interaction.reply({embeds: [alreadyExistEmbed]})
                break
            case 'Success':
                let successEmbed = new Discord.MessageEmbed()
                    .setDescription(`You'll no longer be notified when **${streamer}** goes online.`)
                    .setColor(15158332)
                await interaction.reply({embeds: [successEmbed]})
                break
        }
    } else {
        await noPermission(interaction)
        return
    }
}

export default delStream