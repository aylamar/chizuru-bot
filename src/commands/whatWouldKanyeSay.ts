import Discord, { Interaction } from 'discord.js'
import fetch from 'node-fetch'

async function kanye(interaction: Interaction) {
    if (!interaction.isCommand()) return

    let res = await fetch("https://api.kanye.rest")
    let parsed: any = await res.json()

    const embed = new Discord.MessageEmbed()
        .setAuthor('Kanye West', "https://i.imgur.com/ywPk81X.jpeg", "https://twitter.com/kanyewest/")
        .setDescription(`"${parsed.quote}"`)
    try {
        await interaction.reply({embeds: [embed]})
    } catch (err) {
        console.error(`Error sending help response in ${interaction.channelId}\n${err}`)
    }
}

export default kanye