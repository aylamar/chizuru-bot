import ChannelMgr from './ChannelMgr'
import Discord, { MessageEmbed } from 'discord.js'
import TwitchMgr from './TwitchMgr'
import { Bot } from '../client/client'
import consola from 'consola'

const Stream = require('../models/streamer')
const StreamMgr: any = {}

StreamMgr.run = async function(client: Bot) {
    StreamMgr.initState().then(client.logger.success('Done setting initial stream state'))
    setInterval(StreamMgr.updateState, 1000 * 60, client)
}

StreamMgr.addStreamer = async function(channel_name: string) {
    channel_name = channel_name.toLocaleLowerCase()
    let streamDB = await Stream.findById(channel_name)
    if (streamDB == null){
        let res = await TwitchMgr.getProfile(channel_name)
        if (await res !== 'Unable to locate') {
            try {
                const streamer = await new Stream({
                    _id: channel_name,
                    channel_id: res.id,
                    profile_picture: res.thumbnail_url,
                    current_state: res.is_live
                })
                await streamer.save()
                consola.success(`${channel_name} was added to the database`)
                return 'Success' 
            } catch (err) {
                consola.error(err)
                return 'Failure'
            }
        } else {
            return 'Unable to locate'
        }
    } else {
        consola.info(`It looks like ${channel_name} was already in the database`)
        return 'Success'
    }
}

StreamMgr.delStreamer = async function(channel_name: string) {
    channel_name = channel_name.toLocaleLowerCase()
    let streamDB = await Stream.findById(channel_name)
    if (streamDB == null){
        consola.info(`It doesn't look like ${channel_name} was in the database`)
        return false
    } else {
        try {
            Stream.findOneAndDelete({_id: channel_name})
            consola.success(`Successfully removed ${channel_name} from the database`)
        } catch (err) {
            consola.error('err')
        }
    }
}

// Used to set state during startup to prevent spam
StreamMgr.initState = async function() {
    consola.info('Setting intial state...')
    let token = await TwitchMgr.getToken()
    
    try {
        Stream.find({}, (err: any, streams: any) => {
            if (err) {
                consola.error(err)
            } else {
                streams.map(async (stream: any) => {
                    try {
                        let res = await TwitchMgr.checkStream(stream._id, token)
                        try {
                            if (res == undefined) {
                                // Should be false, set true for testing
                                stream.current_state = false
                                stream.save()
                            } else if (res != undefined) {
                                // Should be true, set false for testing
                                stream.current_state = true
                                stream.save()
                            }
                        } catch (err) {
                            consola.error(err)
                        }
                    } catch (err) {
                        consola.error(err)
                    }
                })
            }
        })
    } catch (err) {
        consola.error(err)
    }
}

// Used for comparing current state to previous state
StreamMgr.updateState = async function(client: Bot) {
    consola.info('Checking monitored streams...')
    let token = await TwitchMgr.getToken()
    Stream.find({}, (err: any, streams: any) => {
        if (err) {
            consola.error(err)
        } else {
            streams.map(async (stream: any) => {
                let res = await TwitchMgr.checkStream(stream._id, token)
                if (res == undefined && stream.current_state === true) {
                    // if streamer goes offline
                    // should be set to false, set to true for testing
                    stream.current_state = false
                    stream.save()

                    let offlineEmbed = genGoOfflineEmbed(stream, client)
                    postStreams(stream._id, offlineEmbed, client)

                } else if (res != undefined && stream.current_state === false) {
                    // if streamer comes online
                    // should be set to true, set to false for testing
                    stream.current_state = true
                    stream.save()

                    let onlineEmbed = genGoLiveEmbed(stream.profile_picture, res, client)
                    postStreams(stream._id, onlineEmbed, client)
                } 
            })
        }
    })
}

async function postStreams(channel_name: string, embed: MessageEmbed, client: Bot) {
    let arr = await ChannelMgr.getChannelByStreamer(channel_name)
    await arr.map(async (channelID: string) => {
        let channel = client.channels.resolve(channelID)
        if (channel.isText()) {
            // Errors seen so far "Missing Permissions": no post perms in channel
            try {
                channel.send({embeds: [embed]})
            } catch (err) {
                consola.error(err)
            }
        } else {
            consola.error(`${channel.id} is not a text based channel`)
        }    
    })

}

function genGoLiveEmbed(profile_picture: string, data: any, client: Bot) {
    const liveEmbed = new Discord.MessageEmbed()
        .setAuthor(data.title, '', `https://twitch.tv/${data.user_login}`)
        .setTitle(data.user_name)
        .setColor(client.colors.success)
        .setDescription(`https://twitch.tv/${data.user_login}`)
        .setURL(`https://twitch.tv/${data.user_login}`)
        .addFields({name: 'Status', value: ':green_circle: Online', inline: true})
        .addFields({ name: 'Viewers', value: data.viewer_count.toString(), inline: true })
        .addFields({ name: 'Streaming', value: data.game_name, inline: true })
        .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${data.user_login}-620x360.jpg`)
        .setThumbnail(profile_picture)
        .setTimestamp()
    return liveEmbed
}

function genGoOfflineEmbed(data: any, client: Bot) {
    const offlineEmbed = new Discord.MessageEmbed()
        .setTitle(`${data._id} has gone offline`)
        .setDescription(`https://twitch.tv/${data._id}`)
        .setThumbnail(data.profile_picture)
        .setColor(client.colors.error)
    return offlineEmbed
}

export default StreamMgr
