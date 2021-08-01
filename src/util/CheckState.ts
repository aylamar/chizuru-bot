import fs from 'fs'
import getTwitchToken from "./GetTwitchToken"
import getChannelStatus from "./GetChannelStatus"

let state: any = [];

async function initState() {
    let token = await getTwitchToken()
    let rawdata: any = fs.readFileSync('./streams.json')
    let data: any = await JSON.parse(rawdata)

    await data.map((e: any) => {
        let data: any = getChannelStatus(e.streamer, token)
        if(data.length === 0) {
            state.push({
                streamer: e.streamer,
                status: false
            })
        } else {
            state.push({
                streamer: e.streamer,
                status: true
            })
        }
    })
}

async function checkState() {

}

export default { initState, checkState }