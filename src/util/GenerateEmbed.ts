import Discord from 'discord.js'

async function generateEmbed(data: any, channel_name: string){
    if (data.length === 0) {
        const offlineEmbed = new Discord.MessageEmbed()
            .setTitle(`${channel_name} has gone offline`)
            .setColor(15158332)
            .setTimestamp()
        return offlineEmbed
    } else {
        const liveEmbed = new Discord.MessageEmbed()
            .setAuthor(data[0].title, '', `https://twitch.tv/${data[0].user_login}`)
            .setTitle(data[0].user_name)
            .setColor(3066993)
            .setDescription(`https://twitch.tv/${data[0].user_login}`)
            .setURL(`https://twitch.tv/${data[0].user_login}`)
            .addFields(
                { name: 'Status', value: ':green_circle: Online', inline: true },
                { name: 'Viewers', value: data[0].viewer_count, inline: true },
                { name: 'Streaming', value: data[0].game_name, inline: true },
            )
            .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${data[0].user_login}-620x360.jpg`)
            //.setImage('') // used for setting avatar
            .setTimestamp()
        return liveEmbed;
    }

}

export default generateEmbed