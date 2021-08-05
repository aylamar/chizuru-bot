import Discord, { Interaction, Permissions } from 'discord.js'
import ChannelMgr from '../util/ChannelMgr'
import { noPermission, somethingWrong } from '../util/CommonReplies'

async function addStream(streamer: string, interaction: Interaction) {
    // Needed for the ability to reply
    if (!interaction.isCommand()) return

    if (typeof interaction.member.permissions === "string") {
        await somethingWrong(interaction)
        return
    } else if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
        let res = await ChannelMgr.addStream(streamer, interaction.channelId)
        switch(res) {
            case 'Already Exists':
                let alreadyExistEmbed = new Discord.MessageEmbed()
                    .setDescription(`You already get notifications for **${streamer}** here.`)
                    .setColor(3066993)
                await interaction.reply({embeds: [alreadyExistEmbed]})
                break
            case 'Success':
                let successEmbed = new Discord.MessageEmbed()
                    .setDescription(`You'll be notified when **${streamer}** goes online.`)
                    .setColor(3066993)
                await interaction.reply({embeds: [successEmbed]})
                break
            case 'Unable to locate':
                let unableEmbed = new Discord.MessageEmbed()
                    .setDescription(`Unable to locate **${streamer}** for some reason, is this the right channel name?`)
                    .setColor(15158332)
                await interaction.reply({embeds: [unableEmbed]})
                break
        }
        return
    } else {
        await noPermission(interaction)
        return
    }
}

export default addStream