import StreamMgr from "./StreamMgr"

const Channel = require('../models/channel')
const ChannelMgr: any = {}

ChannelMgr.addStream = function(id: string, streamer_name: string) {
    Channel.exists({_id: id}).then((res: any) => {
        if (res === true) {
            // If channel exists, check to see if ID has already been added
            Channel.findById(id).then((res: any) => {
                if (res.followed_channels.includes(streamer_name)) {
                    console.log('Streamer already exists!')
                    return
                } else {
                    res.followed_channels.push(streamer_name)
                }
                res.save(function(err: any, result: any) {
                    if (err) {
                        console.log(err)
                    } else {
                        StreamMgr.addStreamer(streamer_name)
                        console.log(`Successfully added ${streamer_name} for #${id}`)
                    }
                })
                console.log('Streamer added to channel!')
            })
        } else {
            // If channel does not exist, create new channel with stream
            const channel = new Channel({
                _id: id,
                followed_channels: streamer_name
            })
            channel.save(function(err: any, result: any) {
                if (err) {
                    console.log(err)
                } else {
                    StreamMgr.addStreamer(streamer_name)
                    console.log(`Successfully added ${streamer_name} for #${id}`)
                }
            })
        }
    })
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

ChannelMgr.getChannelByStreamer = function(streamer_name: string) {
    console.log(`Fetching channels watching ${streamer_name}`)
    Channel.find({ followed_channels: {$in: streamer_name} }).then((res: any) => {
        let idArr: String[] = []
        res.map((e: any) => {
            idArr.push(e._id)
        })
        return idArr
    })
}

export default ChannelMgr