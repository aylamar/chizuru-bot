import TwitchMgr from './TwitchMgr'

const Stream = require('../models/streamer')
const StreamMgr: any = {}

StreamMgr.addStreamer = async function(channel_name: string) {
    channel_name = channel_name.toLocaleLowerCase()
    let streamDB = await Stream.findById(channel_name)
    if (streamDB == null){
        let res = await TwitchMgr.getProfile(channel_name);
        const streamer = await new Stream({
            _id: channel_name,
            channel_id: res.id,
            profile_picture: res.thumbnail_url,
            current_state: res.is_live
        })
        await streamer.save()
        console.log(`${channel_name} was added to the database`)
        return true
    } else {
        console.log(streamDB)
        console.log(`It looks like ${channel_name} was already in the database`)
        return false
    }
}

StreamMgr.delStreamer = function(channel_name: string) {

}

StreamMgr.updateState = function() {

}

StreamMgr.postStreams = function() {
    
}

function generateStreamEmbed() {

}

export default StreamMgr