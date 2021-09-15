import Channel, { discordChannel } from '../models/channel'
import Stream, { streamer } from '../models/streamer'
import { Consola } from 'consola'
import { Bot } from '../client/client'
import { MessageEmbed } from 'discord.js'
import { EmbedColors } from '../interfaces/EmbedColors'
import { LeanDocument } from 'mongoose'

export async function run(client: Bot) {
    await initState(client).then(() => client.logger.success('Done setting initial stream state'))
    setInterval(() => updateState(client), 1000 * 60, client)
}

async function initState(client: Bot): Promise<any> {
    try {
        let streams = await getAllStreams(client.logger)
        streams.map(async (stream: any) => {
            let res = await client.twitch.checkStream(stream._id)
            if (res == undefined) {
                // Should be false, set true for testing
                stream.current_state = false
                stream.save()
            } else if (res != undefined) {
                // Should be true, set false for testing
                stream.current_state = true
                stream.save()
            }
        })
    } catch (err) {
        client.logger.error(err)
    }
    client.logger.info('Done setting intial state...')
    return
}

async function updateState(client: Bot) {
    let streams = await getAllStreams(client.logger)

    streams.map(async (stream: any) => {
        let res = await client.twitch.checkStream(stream._id)
        if (res == undefined && stream.current_state === true) {
            // if streamer goes offline
            // should be set to false, set to true for testing
            stream.current_state = false
            stream.save()

            let offlineEmbed = genGoOfflineEmbed(stream, client.colors)
            postStreams(stream._id, offlineEmbed, client)
        } else if (res != undefined && stream.current_state === false) {
            // if streamer comes online
            // should be set to true, set to false for testing
            stream.current_state = true
            stream.save()

            let onlineEmbed = genGoLiveEmbed(stream.profile_picture, res, client.colors)
            postStreams(stream._id, onlineEmbed, client)
        }
    })
}

async function postStreams(channel_name: string, embed: MessageEmbed, client: Bot) {
    let arr = await getChannelsByStreamer(channel_name, client.logger)
    arr.map(async (channelID: any) => {
        let channel = client.channels.resolve(channelID)
        if (channel.isText()) {
            // Errors seen so far "Missing Permissions": no post perms in channel
            try {
                channel.send({ embeds: [embed] })
            } catch (err) {
                client.logger.error(err)
            }
        } else {
            client.logger.error(`${channel.id} is not a text based channel`)
        }
    })
}

/**
 * Add a stream to the channel database, then add to stream database
 */
export async function addStream(streamer_name: string, channel_id: string, guild_id: string, client: Bot) {
    try {
        let res = await Channel.exists({ _id: channel_id })
        if (res === true) {
            // If channel exists, check to see if ID has already been added
            let channel = await Channel.findById(channel_id)
            if (channel.followed_channels.includes(streamer_name)) {
                return 'Already exists'
            } else {
                let res = await addStreamer(streamer_name, client)
                switch (res) {
                    case 'Success':
                        channel.followed_channels.push(streamer_name)
                        await channel.save()
                        return 'Success'
                    case 'Unable to locate':
                        return 'Unable to locate'
                    case 'Failure':
                        return 'Failure'
                }
            }
        } else {
            // If channel does not exist, create new channel with stream
            let res = await addStreamer(streamer_name, client)
            switch (res) {
                case 'Success':
                    const channel = new Channel({
                        _id: channel_id,
                        guild_id: guild_id,
                        followed_channels: streamer_name,
                    })
                    channel.save()
                    addStreamer(streamer_name, client)
                    return 'Success'
                case 'Unable to locate':
                    return 'Unable to locate'
                case 'Failure':
                    return 'Failure'
            }
        }
    } catch (err) {
        client.logger.error(err)
        return 'Failure'
    }
}

/**
 * Add a streamer to the streamer database
 */
async function addStreamer(channel_name: string, client: Bot) {
    channel_name = channel_name.toLocaleLowerCase()
    let streamDB = await Stream.findById(channel_name)
    if (streamDB == null) {
        let res = await client.twitch.getProfile(channel_name)
        if ((await res) !== 'Unable to locate') {
            try {
                const streamer = new Stream({
                    _id: channel_name,
                    channel_id: res.id,
                    profile_picture: res.thumbnail_url,
                    current_state: res.is_live,
                })
                await streamer.save()
                client.logger.success(`${channel_name} was added to the database`)
                return 'Success'
            } catch (err) {
                client.logger.error(err)
                return 'Failure'
            }
        } else {
            return 'Unable to locate'
        }
    } else {
        client.logger.info(`It looks like ${channel_name} was already in the database`)
        return 'Success'
    }
}

/**
 * Removes a stream from the spcified channel`id` and deletes it from stream database if no channels follow specified streamer
 */
export async function delStream(streamer_name: string, id: string, logger: Consola) {
    try {
        let res = await Channel.find({ _id: id, followed_channels: streamer_name })
        if (res.length === 0) {
            return 'Does not exist'
        } else if (res[0].followed_channels.length === 1 && res[0].followed_channels[0] == streamer_name) {
            await Channel.findOneAndDelete({ _id: id })
            let channelList = await Channel.find({ followed_channels: streamer_name })
            if (channelList.length === 0) {
                delStreamer(streamer_name, logger)
            }
            return 'Success'
        } else {
            res[0].followed_channels = res[0].followed_channels.filter((strm: string) => strm !== streamer_name)
            await res[0].save()
            let channelList = await Channel.find({ followed_channels: streamer_name })
            if (channelList.length === 0) {
                delStreamer(streamer_name, logger)
            }
            return 'Success'
        }
    } catch (err) {
        logger.error(err)
        return 'Failure'
    }
}

/**
 * Removes a streamer to the streamer database
 */
async function delStreamer(channel_name: string, logger: Consola) {
    channel_name = channel_name.toLocaleLowerCase()
    try {
        let streamDB = await Stream.findById(channel_name)
        if (streamDB == null) {
            logger.info(`It doesn't look like ${channel_name} was in the database`)
            return false
        } else {
            await Stream.findOneAndDelete({ _id: channel_name })
            logger.success(`Successfully removed ${channel_name} from the database`)
            return true
        }
    } catch (err) {
        logger.error(err)
        return false
    }
}

export async function getAllStreams(logger: Consola): Promise<streamer[]> {
    try {
        return Stream.find({})
    } catch (err) {
        logger.error(err)
    }
}

export async function getChannelsByStreamer(streamer_name: string, logger: Consola): Promise<String[]> {
    let idArr: String[] = []
    try {
        logger.info(`Fetching all channels watching ${streamer_name}`)
        let res = await Channel.find({ followed_channels: streamer_name }).lean()
        res.map((e: { _id: String }) => {
            idArr.push(e._id)
        })
        return idArr
    } catch (err) {
        logger.error(err)
        return idArr
    }
}

async function getStreamersByChannel(channel_id: string, logger: Consola) {
    try {
        let res = await Channel.find({ _id: channel_id }).lean()
        return res[0].followed_channels
    } catch (err) {
        logger.error(err)
        return null
    }
}

export async function getChannelByGuild(guild_id: string, logger: Consola): Promise<LeanDocument<discordChannel>[]>
{
    try {
        let res = await Channel.find({ guild_id }).lean()
        return res
    } catch (err) {
        logger.error(err)
        return null
    }
}

function genGoLiveEmbed(profile_picture: string, data: any, colors: EmbedColors): MessageEmbed {
    const liveEmbed = new MessageEmbed()
        .setAuthor(data.title, '', `https://twitch.tv/${data.user_login}`)
        .setTitle(data.user_name)
        .setColor(colors.success)
        .setDescription(`https://twitch.tv/${data.user_login}`)
        .setURL(`https://twitch.tv/${data.user_login}`)
        .addFields({ name: 'Status', value: ':green_circle: Online', inline: true })
        .addFields({ name: 'Viewers', value: data.viewer_count.toString(), inline: true })
        .addFields({ name: 'Streaming', value: data.game_name, inline: true })
        .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${data.user_login}-620x360.jpg`)
        .setThumbnail(profile_picture)
        .setTimestamp()
    return liveEmbed
}

function genGoOfflineEmbed(data: any, colors: EmbedColors): MessageEmbed {
    const offlineEmbed = new MessageEmbed()
        .setTitle(`${data._id} has gone offline`)
        .setDescription(`https://twitch.tv/${data._id}`)
        .setThumbnail(data.profile_picture)
        .setColor(colors.error)
    return offlineEmbed
}
