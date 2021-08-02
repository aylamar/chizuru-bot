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

export default ChannelMgr