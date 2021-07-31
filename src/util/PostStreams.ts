import fs from 'fs'
import getChannelStatus from "./GetChannelStatus";

async function postStreams(client: any) {
    let rawdata: any = fs.readFileSync('./streams.json')
    let data: any = await JSON.parse(rawdata)

    await data.map(async (e: any) => {
        let msgGood = await getChannelStatus(e.streamer)
        e.channelID.map(async (cid: string) => {
            let channel = await client.channels.resolve(cid)
            if (channel.isText()) {
                channel.send(msgGood)
            } else {
                console.log(`${channel.id} is not a text based channel`)
            }
        })
    })
}

export default postStreams