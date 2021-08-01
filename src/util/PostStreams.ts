import fs from 'fs'
import getChannelStatus from "./GetChannelStatus";
import TwitchToken from './TwitchToken'
import generateEmbed from './GenerateEmbed';

async function postStreams(client: any) {
    let rawdata: any = fs.readFileSync('./streams.json')
    let data: any = await JSON.parse(rawdata)

    var token: string = await TwitchToken()

    await data.map(async (e: any) => {
        let data = await getChannelStatus(e.streamer, token)
        let embed = await generateEmbed(data, e.streamer)
        e.channelID.map(async (cid: string) => {
            let channel = await client.channels.resolve(cid)
            if (channel.isText()) {
                channel.send(embed)
            } else {
                console.log(`${channel.id} is not a text based channel`)
            }
        })
    })
}

export default postStreams