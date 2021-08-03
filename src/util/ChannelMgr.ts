import StreamMgr from "./StreamMgr"

const Channel = require('../models/channel')
const ChannelMgr: any = {}

ChannelMgr.addStream = async function(streamer_name: string, id: string) {
    let res = await Channel.exists({_id: id})
    if (res === true) {
        // If channel exists, check to see if ID has already been added
        let channel = await Channel.findById(id)
        if (channel.followed_channels.includes(streamer_name)) {
            return 'Already Exists'
        } else {
            let res = await StreamMgr.addStreamer(streamer_name)
            switch (res) {
                case 'Success':
                    try {
                        await channel.followed_channels.push(streamer_name)
                        await channel.save()        
                        return'Success'
                    } catch {
                        return 'Failure'
                    }
                case 'Unable to locate':
                    return 'Unable to locate'
                case 'Failures':
                    return 'Failure'
            }
        }
    } else {
        // If channel does not exist, create new channel with stream
        let res = await StreamMgr.addStreamer(streamer_name)
        switch (res) {
            case 'Success':
                try {
                    const channel = new Channel({
                        _id: id,
                        followed_channels: streamer_name
                    })
                    channel.save()
                    StreamMgr.addStreamer(streamer_name)
                    return 'Success'
                            } catch {
                    return 'Failure'
                }
            case 'Unable to locate':
                return 'Unable to locate'
            case 'Failures':
                return 'Failure'
        }
    }
}

ChannelMgr.delStream = async function(streamer_name: string, id: string) {

    let res = await Channel.find({_id: id, followed_channels: {$in: streamer_name}})
        // If no result found
    if (res.length === 0) {
        return "Doesn't Exist"
    } else if (res[0].followed_channels.length === 1 && res[0].followed_channels[0] == streamer_name) {
        await Channel.findOneAndDelete({_id: id})

        let channelList = await Channel.find({followed_channels: {$in: streamer_name}})
        if (channelList.length === 0) {
            console.log('hit')
            StreamMgr.delStreamer(streamer_name)
        }
        return 'Success'
    } else {
        res[0].followed_channels = await res[0].followed_channels.filter((strm: string) => strm !== streamer_name)
        await res[0].save()

        let channelList = await Channel.find({followed_channels: {$in: streamer_name}})
        if (channelList.length === 0) {
            console.log('hit')
            StreamMgr.delStreamer(streamer_name)
        }
        return 'Success'
    }
}

ChannelMgr.getChannelByStreamer = async function(streamer_name: string) {
    console.log(`${streamer_name} status changed, fetching channels watching ${streamer_name}`)
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