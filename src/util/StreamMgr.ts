const Stream = require('../models/streamer')
const StreamMgr: any = {}
import TwitchMgr from './TwitchMgr'

StreamMgr.addStreamer = async function(channel_name: string) {
    channel_name = channel_name.toLocaleLowerCase()
    //Stream.findById(channel_name).then((res: any) => {
    //    console.log(res)
    //})
    //Check table to see if streamer has been aded
    //If streamer hasn't been added, fetch data & add to db
    let res = await TwitchMgr.getProfile(channel_name)
    console.log(res)
    const streamer = await new Stream({
        _id: channel_name,
        channel_id: res.id,
        profile_picture: res.thumbnail_url,
        current_state: res.is_live
    })
    await streamer.save()

}

StreamMgr.delStreamer = function() {

}

StreamMgr.updateState = function() {

}

StreamMgr.postStreams = function() {
    
}

function generateStreamEmbed() {

}

export default StreamMgr