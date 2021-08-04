import Discord from 'discord.js'
async function help() {
    const embed = new Discord.MessageEmbed()
        .addField("/liststreams", "Lists all of the streams being followed on the server")
        .addField("/addstream <channel>", "Start recieving updates for the specified stream in this channel")
        .addField("/delstream <channel>", 'Stops notifications for the specified stream in this channel')
        .setColor(10181046)
        .setTimestamp()

        return embed
}

export default help