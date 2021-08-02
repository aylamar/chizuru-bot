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
            state.push({ streamer: data[i].streamer, status: false })
        } else {
            state.push({ streamer: data[i].streamer, status: true })
        }
    }
    await checkState()
}

async function deleteState(channel_name: string) {
    console.log(`No longer monitoring ${channel_name}'s state`)
    let newState: any[] = [];
    
    await state.map((e: any) => {
        if(e.streamer === channel_name) { 
        } else {
            newState.push(e)
        }
    })
    state = newState;
}

async function addState(channel_name: string) {
    console.log(`Now monitoring ${channel_name}'s state`)
    let token = await getTwitchToken()
    let res: any = await getChannelStatus(channel_name, token)

    if (res.length == 0) {
        state.push({ streamer: channel_name, status: false })
    } else {
        state.push({ streamer: channel_name, status: true })
    }
}

async function checkState() {
    console.log('Checking monitored streams...')
    let token = await getTwitchToken()
    state.forEach(async (e: any) => {
        let data: any = await getChannelStatus(e.streamer, token)
        if (data.length === 0 && e.status === true) {
            // Streamer went offline, post message
            e.status = false
            let embed = await generateEmbed(data, e.streamer)
            postStreams(e.streamer, embed)
        } else if (data.length !== 0 && e.status === false) {
            // Streamer went online, post message
            e.status = true
            let embed = await generateEmbed(data, e.streamer)
            postStreams(e.streamer, embed)
        }
        // Do nothing if no status change
    });
}

export default { initState, checkState, addState, deleteState }