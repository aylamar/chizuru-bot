import Discord, { Channel } from 'discord.js'
import fs from 'fs'
import { client } from '../app'

async function listStreams(curChannel: Channel) {
    let rawdata: any = fs.readFileSync('./streams.json')
    let data: any = await JSON.parse(rawdata)

    let streamList: string[] = []

    await data.map((e: any) => {
        e.channelID.map(async (cid: string) => {
            if(curChannel.id === cid) {
                streamList.push(e.streamer)
            }
        })
    })

    const listEmbed = new Discord.MessageEmbed()
        .setTitle("Streams you're following:")
        .setTimestamp()

    // Add field for each streamer in current channel
    streamList.forEach(e => listEmbed.addFields({name: `${e}`, value: `<#${curChannel.id}>`, inline: true}))

    if (curChannel.isText()) {
        curChannel.send(listEmbed)
    } else {
        console.log(`${curChannel.id} is not a text based channel`)
    }    
}

export default listStreams