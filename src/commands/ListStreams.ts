import Discord, { Channel } from 'discord.js'
import fs from 'fs'

async function listStreams(curChannel: Channel) {
    let rawdata: any = fs.readFileSync('./streams.json')
    let data: any = await JSON.parse(rawdata)

    let streamList: string[] = []

    // Map through data to generate array of streamers
    await data.map((e: any) => {
        e.channelID.map(async (cid: string) => {
            if(curChannel.id === cid) {
                streamList.push(e.streamer)
            }
        })
    })

    const embed = new Discord.MessageEmbed()
        .setTitle("Streams you're following:")
        .setColor(10181046)
        .setTimestamp()

    // Add field for each streamer in current channel
    streamList.forEach(e => embed.addFields({name: `${e}`, value: `<#${curChannel.id}>`, inline: true}))

    return embed
}

export default listStreams