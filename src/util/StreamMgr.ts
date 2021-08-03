import ChannelMgr from './ChannelMgr'
import Discord, { MessageEmbed } from 'discord.js'
import TwitchMgr from './TwitchMgr'
import { client } from '../app'

const Stream = require('../models/streamer')
const StreamMgr: any = {}

StreamMgr.addStreamer = async function(channel_name: string) {
    channel_name = channel_name.toLocaleLowerCase()
    let streamDB = await Stream.findById(channel_name)
    if (streamDB == null){
        let res = await TwitchMgr.getProfile(channel_name);
        if (await res !== 'Unable to locate') {
            try {
                const streamer = await new Stream({
                    _id: channel_name,
                    channel_id: res.id,
                    profile_picture: res.thumbnail_url,
                    current_state: res.is_live
                })
                await streamer.save()
                console.log(`${channel_name} was added to the database`)
                return 'Success' 
            } catch {
                return 'Failure'
            }
        } else {
            return 'Unable to locate'
        }
    } else {
        console.log(`It looks like ${channel_name} was already in the database`)
        return 'Success'
    }
}

StreamMgr.delStreamer = async function(channel_name: string) {
    channel_name = channel_name.toLocaleLowerCase()
    let streamDB = await Stream.findById(channel_name)
    if (streamDB == null){
        console.log(`It doesn't look like ${channel_name} was in the database`)
        return false
    } else {
        Stream.findOneAndDelete({_id: channel_name}, function(err: any, result: any) {
            if (err) {
                console.log(err)
            } else {
                console.log(`Successfully removed ${channel_name} from the database`)
            }
        })
    }
}

// Used to set state during startup to prevent spam
StreamMgr.initState = async function() {
    console.log('Setting intial state...')
    let token = await TwitchMgr.getToken()

    Stream.find({}, (err: any, streams: any) => {
        if(err) {
            console.log(err)
        } else {
            streams.map(async (stream: any) => {
                let res = await TwitchMgr.checkStream(stream._id, token)
                if (res == undefined) {
                    stream.current_state = false
                    stream.save()
                } else if (res != undefined) {
                    stream.current_state = true
                    stream.save()
                }
            })
        }
    })
}

// Used for comparing current state to previous state
StreamMgr.updateState = async function() {
    console.log('Checking monitored streams...')
    let token = await TwitchMgr.getToken()
    Stream.find({}, (err: any, streams: any) => {
        if(err) {
            console.log(err)
        } else {
            streams.map(async (stream: any) => {
                let res = await TwitchMgr.checkStream(stream._id, token)
                if (res == undefined && stream.current_state === true) {
                    // if streamer goes offline
                    // should be set to true, set to false for testing
                    stream.current_state = false
                    stream.save()

                    let offlineEmbed = genGoOfflineEmbed(stream)
                    postStreams(stream._id, offlineEmbed)

                } else if (res != undefined && stream.current_state === false) {
                    // if streamer comes online
                    // should be set to false, set to true for testing
                    stream.current_state = true
                    stream.save()

                    let onlineEmbed = genGoLiveEmbed(stream.profile_picture, res)
                    postStreams(stream._id, onlineEmbed)
                } 
            })
        }
    })
}

async function postStreams(channel_name: string, embed: MessageEmbed) {
    let arr = await ChannelMgr.getChannelByStreamer(channel_name)
    await arr.map(async (channelID: string) => {
        let channel = client.channels.resolve(channelID)
        if (channel.isText()) {
            channel.send(embed)
        } else {
            console.log(`${channel.id} is not a text based channel`)
        }    
    })

}

function genGoLiveEmbed(pfp: string, data: any) {
    const liveEmbed = new Discord.MessageEmbed()
        .setAuthor(data.title, '', `https://twitch.tv/${data.user_login}`)
        .setTitle(data.user_name)
        .setColor(3066993)
        .setDescription(`https://twitch.tv/${data.user_login}`)
        .setURL(`https://twitch.tv/${data.user_login}`)
        .addFields(
            { name: 'Status', value: ':green_circle: Online', inline: true },
            { name: 'Viewers', value: data.viewer_count, inline: true },
            { name: 'Streaming', value: data.game_name, inline: true },
        )
        .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${data.user_login}-620x360.jpg`)
        .setThumbnail(pfp)
        .setTimestamp()
    return liveEmbed
}

function genGoOfflineEmbed(data: any) {
    const offlineEmbed = new Discord.MessageEmbed()
        .setTitle(`${data._id} has gone offline`)
        .setDescription(`https://twitch.tv/${data._id}`)
        .setThumbnail(data.profile_picture)
        .setColor(15158332)
    return offlineEmbed
}

export default StreamMgr