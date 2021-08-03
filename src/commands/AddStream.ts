/*
import fs from 'fs'
import state from '../util/CheckState'
import Discord from 'discord.js'

async function AddStream(streamer: string, channelID: string) {
    try {
        // Read file from system & parse
        let rawdata: any = fs.readFileSync('./streams.json')
        let data: any = await JSON.parse(rawdata)
        let exists = false

        streamer = streamer.toLowerCase()

        // Map through data & add if streamer exists & channelID hasn't already been added
        data.map((e: any) => {
            if (e.streamer === streamer) {
                exists = true
                let existsCID = false
                e.channelID.map((cid: string) => {
                    if(cid === channelID) {
                        existsCID = true
                    }
                })
                if (existsCID === false) {
                    e.channelID.push(channelID)
                    state.addState(streamer)
                    writeData(data)
                    return addStreamEmbedGen(streamer, true)
                }
            }
        })

        // If does not exist, add to data & write
        if (exists === false) {
            data.push({
                streamer: streamer,
                channelID: [channelID]
            })
            state.addState(streamer)
            writeData(data)
            return addStreamEmbedGen(streamer, true)
        } else {
            return addStreamEmbedGen(streamer, false)
        }
    } catch {
        // If no streams.json file, create a new one
        console.log("No 'streams.json' file file...")
        let data: any = [
            {
                streamer: streamer,
                channelID: [channelID]
            }
        ]
        state.addState(streamer)
        writeData(data)
        return addStreamEmbedGen(streamer, true);
    }
}

function addStreamEmbedGen(streamer: string, status: boolean) {
    let embed = new Discord.MessageEmbed()
        .setColor(3066993)
    if (status === true) {
        embed.setDescription(`You'll be notified when **${streamer}** comes online.`)
    } else {
        embed.setDescription(`**${streamer}** is already being followed.`)
    }
    return embed
}

// Used for writing data back to drive
async function writeData(data: object) {
    fs.writeFileSync('./streams.json', JSON.stringify(data))
}

export default AddStream
*/