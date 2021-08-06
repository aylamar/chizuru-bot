import Discord, { Interaction } from 'discord.js'
async function help(interaction: Interaction) {
    if (!interaction.isCommand()) return
    const embed = new Discord.MessageEmbed()
        .addField("/liststreams", "Lists all of the streams being followed on the server")
        .addField("/addstream <channel>", "Start recieving updates for the specified stream in this channel")
        .addField("/delstream <channel>", 'Stops notifications for the specified stream in this channel')
        .setColor(10181046)
        .setTimestamp()
    try {
        await interaction.reply({embeds: [embed]})
    } catch (err) {
        console.error(`Error sending help response in ${interaction.channelId}\n${err}`)
    }
}

export default help