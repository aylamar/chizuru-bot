import fs from 'fs'
import state from '../util/CheckState'
import Discord, { MessageEmbed } from 'discord.js'

async function deleteStream(streamer: string, channelID: string){
    try {
        let rawdata: any = fs.readFileSync('./streams.json')
        let data: any = await JSON.parse(rawdata)
        let exists = false
        let newData: any[] = []

        streamer = streamer.toLowerCase()
        
        await data.map((e: any) => {
            if(e.streamer === streamer && e.channelID.length > 1) {
                const filteredCID = e.channelID.filter((cid: string) => cid !== channelID)
                newData.push({
                    streamer: e.streamer,
                    channelID: filteredCID
                })
                // Multiple channels have the streamer followed
            } else if (e.streamer === streamer && e.channelID.length === 1) {
                state.deleteState(streamer)
            } else {
                newData.push(e)
            }
        })
        await writeData(newData)
        console.log(await newData)

        const msg: MessageEmbed = new Discord.MessageEmbed()
            .setTitle(`Alerts for ${streamer} will no longer appear here.`)
            .setColor(15158332)
            .setTimestamp()
        return msg

    } catch {
        // If no streams.json
        const msg: MessageEmbed = new Discord.MessageEmbed()
            .setDescription(`Something went wrong removing ${streamer}`)
            .setColor(15158332)
            .setTimestamp()
        return msg
    }
}

async function writeData(data: object) {
    fs.writeFileSync('./streams.json', JSON.stringify(data))
}

export default deleteStream