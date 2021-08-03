import StreamMgr from "./StreamMgr"

const Channel = require('../models/channel')
const ChannelMgr: any = {}

ChannelMgr.addStream = async function(streamer_name: string, id: string) {
    let res = await Channel.exists({_id: id})
    console.log(res)
    if (res === true) {
        // If channel exists, check to see if ID has already been added
        let channel = await Channel.findById(id)
        if (channel.followed_channels.includes(streamer_name)) {
            console.log('Streamer already exists!')
            return 'Already Exists'
        } else {
            await channel.followed_channels.push(streamer_name)
            await channel.save()
            StreamMgr.addStreamer(streamer_name)
            console.log(`Successfully added ${streamer_name} for #${id}`)
            return 'Success'   
        }
    } else {
        // If channel does not exist, create new channel with stream
        const channel = new Channel({
            _id: id,
            followed_channels: streamer_name
        })
        channel.save()
        StreamMgr.addStreamer(streamer_name)
        console.log(`Successfully added ${streamer_name} for #${id}`)
        return 'Success'
    }
}

ChannelMgr.delStream = function(id: string, streamer_name: string) {
    Channel.find({_id: id, followed_channels: {$in: streamer_name}}).then((res: any) => {
        // If no result found
        if (res.length === 0) {
            console.log(`${streamer_name} does not exist in this channel`)
        } else if (res[0].followed_channels.length === 1 && res[0].followed_channels[0] == streamer_name) {
            Channel.findOneAndDelete({_id: id}, function(err: any, result: any) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(`Successfully removed ${streamer_name} from #${id} & cleared from db`)
                }
            })
        } else {
            res[0].followed_channels = res[0].followed_channels.filter((strm: string) => strm !== streamer_name)
            res[0].save(function(err: any, result: any) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(`Successfully removed ${streamer_name} from #${id}`)
                }
            })
            console.log(`Removed ${streamer_name} from ${id}`)
        }
    })
    // TODO: Check if streamer exists in any other channels, if not, delete streamer 
    //StreamMgr.delStreamer(streamer_name)
}

ChannelMgr.getChannelByStreamer = async function(streamer_name: string) {
    console.log(`Fetching channels watching ${streamer_name}`)
    let res = await Channel.find({ followed_channels: {$in: streamer_name} })
    let idArr: String[] = []
    await res.map((e: any) => {
        idArr.push(e._id)
    })
    return idArr
}

ChannelMgr.getStreamersByChannel = function () {
    // TODO
}

export default ChannelMgr