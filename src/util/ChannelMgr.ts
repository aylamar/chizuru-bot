import StreamMgr from "./StreamMgr"

const Channel = require('../models/channel')
const ChannelMgr: any = {}

ChannelMgr.addStream = async function(streamer_name: string, channel_id: string, guild_id: string) {
    try {
        let res = await Channel.exists({_id: channel_id})
        if (res === true) {
            // If channel exists, check to see if ID has already been added
            let channel = await Channel.findById(channel_id)
            if (channel.followed_channels.includes(streamer_name)) {
                return 'Already Exists'
            } else {
                let res = await StreamMgr.addStreamer(streamer_name)
                switch (res) {
                    case 'Success':
                        try {
                            await channel.followed_channels.push(streamer_name)
                            await channel.save()        
                            return 'Success'
                        } catch (err) {
                            console.error(`Error adding ${streamer_name} to ${channel_id}\n${err}`)
                            return 'Failure'
                        }
                    case 'Unable to locate':
                        return 'Unable to locate'
                    case 'Failure':
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
                            _id: channel_id,
                            guild_id: guild_id,
                            followed_channels: streamer_name
                        })
                        channel.save()
                        StreamMgr.addStreamer(streamer_name)
                        return 'Success'
                    } catch (err) {
                        console.error(`Error creating new channel entry for ${channel_id}\n${err}`)
                        return 'Failure'
                    }
                case 'Unable to locate':
                    return 'Unable to locate'
                case 'Failure':
                    return 'Failure'
            }
        }
    } catch (err) {
        console.error(`Something went wrong adding ${streamer_name} to ${channel_id}\n${err}`)
    }
}

ChannelMgr.delStream = async function(streamer_name: string, id: string) {
    try {
        let res = await Channel.find({_id: id, followed_channels: {$in: streamer_name}})
            // If no result found
        if (res.length === 0) {
            return "Doesn't Exist"
        } else if (res[0].followed_channels.length === 1 && res[0].followed_channels[0] == streamer_name) {
            await Channel.findOneAndDelete({_id: id})

            let channelList = await Channel.find({followed_channels: {$in: streamer_name}})
            if (channelList.length === 0) {
                StreamMgr.delStreamer(streamer_name)
            }
            return 'Success'
        } else {
            res[0].followed_channels = await res[0].followed_channels.filter((strm: string) => strm !== streamer_name)
            await res[0].save()

            let channelList = await Channel.find({followed_channels: {$in: streamer_name}})
            if (channelList.length === 0) {
                StreamMgr.delStreamer(streamer_name)
            }
            return 'Success'
        }
    } catch (err) {
        console.error(`Something went wrong deleting ${streamer_name} from ${id}\n${err}`)
        return 'Failure'
    }
}

ChannelMgr.getChannelByStreamer = async function(streamer_name: string) {
    try {
        console.log(`Fetching all channels watching ${streamer_name}`)
        let res = await Channel.find({ followed_channels: {$in: streamer_name} }).lean()
        let idArr: String[] = []
        await res.map((e: { _id: String }) => {
            idArr.push(e._id)
        })
        return idArr
    } catch (err) {
        console.error(`Something went wrong fetching ${streamer_name} from the database\n${err}`)
        return null
    }
}

ChannelMgr.getStreamersByChannel = async function (channel_id: string) {
    try {
        let res = await Channel.find({_id: channel_id}).lean()
        return await res[0].followed_channels
    } catch (err) {
        console.error(`Something went wrong fetching ${channel_id} from the database\n${err}`)
        return null
    }
}

ChannelMgr.getChannelByGuild = async function(guild_id: string) {
    try {
        let res = await Channel.find({guild_id}).lean()
        return res;
    } catch (err) {
        console.error(`Something wrent wrong fetching streams in ${guild_id} from the database\n${err}`)
        return null
    }
}

export default ChannelMgr