import fs from 'fs'
import { client } from '../app'
import { MessageEmbed } from 'discord.js';


async function postStreams(streamer: string, embed: MessageEmbed) {
    let rawdata: any = fs.readFileSync('./streams.json')
    let data: any = await JSON.parse(rawdata)

    await data.map(async (e: any) => {
        if (e.streamer === streamer){
            e.channelID.map(async (cid: string) => {
                let channel = client.channels.resolve(cid)
                if (channel.isText()) {
                    channel.send(embed)
                } else {
                    console.log(`${channel.id} is not a text based channel`)
                }    
            })
        }
    })
}

export default postStreams