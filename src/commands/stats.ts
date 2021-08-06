import Discord, { Interaction } from 'discord.js'
import { client } from '../app'

async function stats(commandsRun: number, interaction: Interaction) {
    if (!interaction.isCommand()) return
    const memUsed = process.memoryUsage().heapUsed / 1024 / 1024
    let uptime = formatTime(process.uptime())
    let presence = formatPresence()

    const embed = new Discord.MessageEmbed()
        .setAuthor("ChizuruBot", 'https://i.imgur.com/3kTVxnq.jpg')
        .addFields(
                {name: 'Author', value: `aylamar#0001`, inline: true},
                {name: 'Commands ran', value: `${commandsRun}`, inline: true},
                {name: 'Memory Usage', value: `${Math.round(memUsed * 100) / 100} MB`, inline: true},
                {name: 'Something', value: 'Something eventually', inline: true},
                {name: 'Presence', value: `${presence.servers}`, inline: true},
                {name: 'Uptime', value: `${uptime.day}\n${uptime.hour}\n${uptime.minute}`, inline: true}
            )
        .setColor(10181046)
    try {
        await interaction.reply({embeds: [embed]})
    } catch (err) {
        console.error(`Error sending stats response in ${interaction.channelId}\n${err}`)
    }
}

function formatPresence() {
    let serverCount = client.guilds.cache.size
    
    //let channels = bot.channels.cache.size
    let data = {
        servers: serverCount + (serverCount == 1 ? ' server' : ' servers')
    }
    return data
}

function formatTime(seconds: number) {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600*24))
    var h = Math.floor(seconds % (3600*24) / 3600)
    var m = Math.floor(seconds % 3600 / 60)
    var s = Math.floor(seconds % 60)
    
    let data = {
        day: d > 0 ? d + (d == 1 ? " day" : " days") : "0 days",
        hour: h > 0 ? h + (h == 1 ? " hour" : " hours") : "0 hours",
        minute: m > 0 ? m + (m == 1 ? " minute" : " minutes") : "0 minutes",
        second: s > 0 ? s + (s == 1 ? " second" : " seconds") : "0 seconds",
    }

    return data
}


export default stats