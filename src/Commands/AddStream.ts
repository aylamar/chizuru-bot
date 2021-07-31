import fs from 'fs'

    /* future interface

    interface IsStreamerList {
        [index: number]: {
            streamer: string
            channelID: string
        }
    } */


async function AddStream(streamer: string, channelID: string) {
    try {
        // Read file from system & parse
        let rawdata: any = fs.readFileSync('./streams.json')
        let data: any = await JSON.parse(rawdata)
        let exists = false

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
                    writeData(data)
                    return true
                }
            }
        })

        // If does not exist, add to data & write
        if (exists === false) {
            data.push({
                streamer: streamer,
                channelID: [channelID]
            })
            writeData(data)
            return true
        } else {
            return false
        }
    } catch {
        console.log("No 'streams.json' file file...")
        let data: any = [
            {
                streamer: streamer,
                channelID: [channelID]
            }
        ]
        writeData(data)
        return true;
    }
}

async function writeData(data: object) {
    fs.writeFileSync('./streams.json', JSON.stringify(data))
}

export default AddStream