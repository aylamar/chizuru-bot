const Channel = require('../models/channel')
const ChannelMgr: any = {}

ChannelMgr.addStream = function(id: string, stream: string) {
    Channel.exists({_id: id}).then((res: any) => {
        if (res === true) {
            // If channel exists, check to see if ID has already been added
            Channel.findById(id).then((res: any) => {
                if (res.followed_channels.includes(stream)) {
                    console.log('Streamer already exists!')
                    return
                } else {
                    res.followed_channels.push(stream)
                }
                res.save(function(err: any, result: any) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(`Successfully added ${stream} for #${id}`)
                    }
                })
                console.log('Streamer added to channel!')
            })
        } else {
            // If channel does not exist, create new channel with stream
            const channel = new Channel({
                _id: id,
                followed_channels: stream
            })
            channel.save(function(err: any, result: any) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(`Successfully added ${stream} for #${id}`)
                }
            })
        }
    })
    // TODO: Check if streamer exists in streamer db, if not, add to db
}

ChannelMgr.delStream = function(id: string, stream: string) {
    Channel.find({_id: id, followed_channels: {$in: stream}}).then((res: any) => {
        // If no result found
        if (res.length === 0) {
            console.log(`${stream} does not exist in this channel`)
        } else if (res[0].followed_channels.length === 1 && res[0].followed_channels[0] == stream) {
            Channel.findOneAndDelete({_id: id}, function(err: any, result: any) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(`Successfully removed ${stream} from #${id} & cleared from db`)
                }
            })
        } else {
            res[0].followed_channels = res[0].followed_channels.filter((strm: string) => strm !== stream)
            res[0].save(function(err: any, result: any) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(`Successfully removed ${stream} from #${id}`)
                }
            })
            console.log(`Removed ${stream} from ${id}`)
        }
    })
    // TODO: Check if streamer exists in any other channels, if not, delete streamer 
}

export default ChannelMgr