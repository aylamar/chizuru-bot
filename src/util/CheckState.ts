import fs from 'fs'
import getTwitchToken from "./GetTwitchToken"
import getChannelStatus from "./GetChannelStatus"
import generateEmbed from './GenerateEmbed';
import postStreams from './PostStreams';

let state: any = [];

async function initState() {
    let token = await getTwitchToken()
    let rawdata: any = fs.readFileSync('./streams.json')
    let data: any = await JSON.parse(rawdata)

    for(let i = 0; i < data.length; i++){
        let res: any = await getChannelStatus(data[i].streamer, token)
        // Set status to TRUE if online, or FALSE if offline
        if(res.length == 0) {
            state.push({
                streamer: data[i].streamer,
                status: false
            })
        } else {
            state.push({
                streamer: data[i].streamer,
                // should be true, but false for testing
                status: true
            })
        }
    }
    await checkState()
}

async function addState(channl_name: string) {
    // add to state array
}

async function checkState() {
    let token = await getTwitchToken()
    state.forEach(async (e: any) => {
        let data: any = await getChannelStatus(e.streamer, token)
        /*
        if(await data.length === 0 && e.status === false) {
            // Do nothing, previously offline and still offline
            // Safe to remove once finished
            // console.log('offline', e.streamer, data.length)
        } else if (data.length !==0 && e.status === true) {
            // Do nothing, previously online and still online
            // Safe to remove once finished
            // console.log('streamer is still online', e.streamer, data.length)
        } else */
        if (data.length === 0 && e.status === true) {
            // Streamer went online, post message
            // console.log('streamer has come online', e.streamer, data.length)
            e.status = true
        } else if (data.length !== 0 && e.status === false) {
            // Streamer went offline, post message
            // console.log('streamer has gone offline', e.streamer, data.length)
            e.status = false
            let embed = await generateEmbed(data, e.streamer)
            postStreams(e.streamer, embed)
        } /*else {
            console.log("no status change")
        }*/
    });
}

export default { initState, checkState, addState }