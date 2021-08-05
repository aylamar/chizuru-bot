import Discord, { Interaction, Permissions } from 'discord.js'
import ChannelMgr from '../util/ChannelMgr'

async function addStream(streamer: string, interaction: Interaction) {
    // Needed 
    if (!interaction.isCommand()) return;

    if (typeof interaction.member.permissions === "string") {
        await interaction.reply({ content: "Something went wrong, try again?", ephemeral: true })
        return
    } else if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
        let res = await ChannelMgr.addStream(streamer, interaction.channelId)
        switch(res) {
            case 'Already Exists':
                let alreadyExistEmbed = new Discord.MessageEmbed()
                    .setDescription(`You already get notifications for **${streamer}** here.`)
                    .setColor(3066993)
                await interaction.reply({embeds: [alreadyExistEmbed]});
                break
            case 'Success':
                let successEmbed = new Discord.MessageEmbed()
                    .setDescription(`You'll be notified when **${streamer}** goes online.`)
                    .setColor(3066993)
                await interaction.reply({embeds: [successEmbed]});
                break
            case 'Unable to locate':
                let unableEmbed = new Discord.MessageEmbed()
                    .setDescription(`Unable to locate **${streamer}** for some reason, is this the right channel name?`)
                    .setColor(15158332)
                await interaction.reply({embeds: [unableEmbed]});
                break
        }
        return
    } else {
        await interaction.reply({ content: "You don't have permission for this.", ephemeral: true })
        return
    }
}

export default addStream