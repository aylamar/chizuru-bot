import Channel from '../models/channel'
import Stream from '../models/streamer'
import { Consola } from 'consola'
import { Bot } from '../client/client'
import { MessageEmbed } from 'discord.js'
import { EmbedColors } from '../interfaces/EmbedColors'
import { getGuild } from './Guild'

interface streamer {
    username: string
    channelId: string
    profilePicture: string
    followedBy: string[]
    currentState: boolean
}

type StreamerCache = {
    [key: string]: streamer
}

interface discChannel {
    channelId: string
    followedChannels: string[]
    guildId: string
}

type WatchingCache = {
    [key: string]: discChannel
}

export class Streams {
    streamers: string[]
    streamerCache: StreamerCache
    watchingCache: WatchingCache

    public constructor(client: Bot) {
        this.streamers = []
        this.streamerCache = {}
        this.watchingCache = {}
        this.initState(client).then(() => client.logger.success('Done setting initial stream state'))
        setInterval(() => this.updateState(client), 1000 * 20, client)
    }

    private static genGoLiveEmbed(profile_picture: string, data: any, colors: EmbedColors): MessageEmbed {
        return new MessageEmbed()
            .setAuthor(data.title, '', `https://twitch.tv/${data.user_login}`)
            .setTitle(data.user_name)
            .setColor(colors.success)
            .setDescription(`https://twitch.tv/${data.user_login}`)
            .setURL(`https://twitch.tv/${data.user_login}`)
            .addFields({
                name: 'Status',
                value: ':green_circle: Online',
                inline: true
            })
            .addFields({
                name: 'Viewers',
                value: data.viewer_count.toString(),
                inline: true
            })
            .addFields({
                name: 'Streaming',
                value: data.game_name,
                inline: true
            })
            .setImage(
                `https://static-cdn.jtvnw.net/previews-ttv/live_user_${data.user_login}-620x360.jpg`
            )
            .setThumbnail(profile_picture)
            .setTimestamp()
    }

    private static genGoOfflineEmbed(streamer: streamer, colors: EmbedColors): MessageEmbed {
        return new MessageEmbed()
            .setTitle(`${streamer.username} has gone offline`)
            .setDescription(`https://twitch.tv/${streamer.username}`)
            .setThumbnail(streamer.profilePicture)
            .setColor(colors.error)
    }

    public async addStream(streamer_name: string, channel_id: string, guild_id: string, client: Bot) {
        try {
            let res = await Channel.exists({ _id: channel_id })
            if (res === true) {
                // If channel exists, check to see if ID has already been added
                let channel = await Channel.findById(channel_id)
                if (channel.followed_channels.includes(streamer_name)) {
                    return 'Already exists'
                } else {
                    let res = await this.addStreamer(streamer_name, client)
                    switch (res) {
                        case 'Success':
                            channel.followed_channels.push(streamer_name)
                            await channel.save()

                            this.streamerCache[streamer_name].followedBy.push(channel_id)
                            return 'Success'
                        case 'Unable to locate':
                            return 'Unable to locate'
                        case 'Failure':
                            return 'Failure'
                    }
                }
            } else {
                // If channel does not exist, create new channel with stream
                let res = await this.addStreamer(streamer_name, client)
                switch (res) {
                    case 'Success':
                        const channel = new Channel({
                            _id: channel_id,
                            guild_id: guild_id,
                            followed_channels: streamer_name
                        })
                        await channel.save()

                        this.watchingCache[channel_id] = {
                            channelId: channel_id,
                            followedChannels: [streamer_name],
                            guildId: guild_id
                        }
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

    public async delStream(streamer_name: string, id: string, logger: Consola) {
        try {
            let res = await Channel.find({ _id: id, followed_channels: streamer_name })
            if (res.length === 0) {
                return 'Does not exist'
            } else if (res[0].followed_channels.length === 1 && res[0].followed_channels[0] == streamer_name) {
                await Channel.findOneAndDelete({ _id: id })
                delete this.watchingCache[id]
            } else {
                res[0].followed_channels = res[0].followed_channels.filter((streamers) => streamers !== streamer_name)
                this.watchingCache[id].followedChannels = this.watchingCache[id].followedChannels
                    .filter((streamers) => {
                        streamers !== streamer_name
                    })
                await res[0].save()
            }

            let channelList = await Channel.find({ followed_channels: streamer_name })
            if (channelList.length === 0) {
                await this.delStreamer(streamer_name, logger)
            }
            return 'Success'
        } catch (err) {
            logger.error(err)
            return 'Failure'
        }
    }

    public async getChannelByGuild(guild_id: string, logger: Consola) {
        try {
            return await Channel.find({ guild_id }).lean()
        } catch (err) {
            logger.error(err)
            return null
        }
    }

    private async initState(client: Bot) {
        let streamList = await Stream.find({}).lean()
        await Promise.all(
            streamList.map(async (stream) => {
                let res = await client.twitch.checkStream(stream._id)

                let state = false
                if (res != undefined) state = true

                this.streamers.push(stream._id)
                this.streamerCache[stream._id] = {
                    username: stream._id,
                    channelId: stream.channel_id,
                    profilePicture: stream.profile_picture,
                    followedBy: [],
                    currentState: state
                }
            })
        )

        let channelList = await Channel.find({})
        await Promise.all(
            channelList.map(async (channel) => {
                this.watchingCache[channel._id] = {
                    channelId: channel._id,
                    followedChannels: channel.followed_channels,
                    guildId: channel.guild_id
                }
                channel.followed_channels.forEach((i) => {
                    this.streamerCache[i].followedBy.push(channel._id)
                })
            })
        )
    }

    private async updateState(client: Bot) {
        this.streamers.map(async (streamer) => {
            try {
                let res = await client.twitch.checkStream(streamer)
                if (res == undefined && this.streamerCache[streamer].currentState === true) {
                    // if streamer goes offline
                    // should be set to false, set to true for testing
                    this.streamerCache[streamer].currentState = false

                    let offlineEmbed = Streams.genGoOfflineEmbed(this.streamerCache[streamer], client.colors)
                    await this.postStreams(streamer, offlineEmbed, client, false)
                } else if (res != undefined && this.streamerCache[streamer].currentState === false) {
                    // if streamer comes online
                    // should be set to true, set to false for testing
                    this.streamerCache[streamer].currentState = true

                    let onlineEmbed = Streams.genGoLiveEmbed(this.streamerCache[streamer].profilePicture, res, client.colors)
                    await this.postStreams(streamer, onlineEmbed, client, true)
                }
            } catch (err) {
                client.logger.error(err)
            }
        })
    }

    private async postStreams(streamerName: string, embed: MessageEmbed, client: Bot, goLive: boolean) {
        this.streamerCache[streamerName].followedBy.map(async (channel) => {
            try {
                let discChannel = client.channels.resolve(channel)
                if (discChannel.isText()) {
                    // Errors seen so far "Missing Permissions": no post perms in channel
                    try {
                        let guildId = this.watchingCache[channel].guildId
                        if (goLive === true) {
                            let notify: boolean
                            if (!client.cache[guildId]) {
                                let data = await getGuild(guildId)
                                client.cache[guildId] = data
                                notify = data.streamPing
                            } else {
                                notify = client.cache[guildId].streamPing
                            }

                            if (notify != undefined && notify === true) {
                                return discChannel.send({ content: '@everyone', embeds: [embed] })
                            } else {
                                return discChannel.send({ embeds: [embed] })
                            }
                        } else {
                            return discChannel.send({ embeds: [embed] })
                        }
                    } catch (err) {
                        client.logger.error(err)
                        return
                    }
                } else {
                    client.logger.error(`${discChannel.id} is not a text based channel`)
                    return
                }
            } catch (err) {
                client.logger.error(err)
                return
            }
        })
    }

    private async addStreamer(streamer_name: string, client: Bot) {
        streamer_name = streamer_name.toLocaleLowerCase()
        let streamDB = await Stream.findById(streamer_name)
        if (streamDB == null) {
            let res = await client.twitch.getProfile(streamer_name)
            if ((await res) !== 'Unable to locate') {
                try {
                    const streamer = new Stream({
                        _id: streamer_name,
                        channel_id: res.id,
                        profile_picture: res.thumbnail_url,
                        current_state: res.is_live
                    })
                    await streamer.save()

                    this.streamerCache[streamer_name] = {
                        username: streamer_name,
                        channelId: res.id,
                        profilePicture: res.thumbnail_url,
                        followedBy: [],
                        currentState: res.is_live
                    }

                    client.logger.success(`${streamer_name} was added to the database`)
                    return 'Success'
                } catch (err) {
                    client.logger.error(err)
                    return 'Failure'
                }
            } else {
                return 'Unable to locate'
            }
        } else {
            client.logger.info(`It looks like ${streamer_name} was already in the database`)
            return 'Success'
        }
    }

    private async delStreamer(streamer_name: string, logger: Consola) {
        streamer_name = streamer_name.toLocaleLowerCase()
        try {
            let streamDB = await Stream.findById(streamer_name)
            if (streamDB == null) {
                logger.info(`It doesn't look like ${streamer_name} was in the database`)
                return false
            } else {
                await Stream.findOneAndDelete({ _id: streamer_name })
                delete this.streamerCache[streamer_name]
                let idx = this.streamers.indexOf(streamer_name)
                this.streamers.splice(idx, 1)
                logger.success(`Successfully removed ${streamer_name} from the database`)
                return true
            }
        } catch (err) {
            logger.error(err)
            return false
        }
    }
}
