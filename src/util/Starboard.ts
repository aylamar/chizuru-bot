import { Bot } from '../client/client'
import { Collection, Message, MessageEmbed, MessageOptions, MessageReaction, Snowflake, TextChannel } from 'discord.js'
import Starboard from '../models/starboard'
import { StarboardClientOptions, StarboardGuild, starMessageData } from '../interfaces/Starboard'

export class StarboardClient {
    public client: Bot
    public guilds: StarboardGuild[]
    public cache: Collection<Snowflake, starMessageData[]> = new Collection()
    public config = {
        set: (StarboardGuilds: StarboardGuild[]) => {
            this.guilds = StarboardGuilds
            this.cacheData()
        },

        add: (StarboardGuild: StarboardGuild) => {
            const filtered = (this.guilds || []).filter(
                (x) => x.id === StarboardGuild.id
            )

            this.guilds = [...filtered, StarboardGuild]
            this.cacheData()
        },

        create: async (client: Bot, guildId: Snowflake, channelId: Snowflake, emote: string, starCount: number) => {
            try {
                const data = await Starboard.findById(guildId)
                if (data)
                    return 'A starboard has already been created for this server, delete it first to create a new one'

                const newStarboard = new Starboard({
                    _id: guildId,
                    star_count: starCount,
                    star_channel: channelId,
                    star_emote: emote,
                    banned_users: [],
                    blacklisted_channels: []
                })
                await newStarboard.save()

                this.config.add({
                    id: guildId,
                    options: {
                        starCount: starCount,
                        starboardChannel: channelId,
                        starEmote: emote,
                        bannedUsers: [],
                        blacklistedChannels: []
                    }
                })
                return true
            } catch (err) {
                client.logger.error(err)
                return `Something went wrong, try again in a few minutes`
            }
        },

        delete: async (guildId: Snowflake, client: Bot): Promise<Boolean> => {
            try {
                const data = await Starboard.findById(guildId)
                if (data) data.delete()
                await this.start(client)
                return true
            } catch (err) {
                client.logger.error(err)
                return false
            }
        },

        blacklistChannel: async (guildId: Snowflake, channelId: Snowflake) => {
            const data = await Starboard.findById(guildId)

            if (data.blacklisted_channels.includes(channelId)) {
                let idx = data.blacklisted_channels.indexOf(channelId)
                await data.save()
                data.blacklisted_channels.splice(idx, 1)
            } else {
                data.blacklisted_channels.push(channelId)
                await data.save()
            }

            const channels = this.getData(guildId)?.options.blacklistedChannels
            if (channels.includes(channelId)) {
                let idx = channels.indexOf(channelId)
                channels.splice(idx, 1)
                return `Messages from <#${channelId}> will now appear in the starboard.`
            } else {
                channels.push(channelId)
                return `Messages from <#${channelId}> will no longer appear in the starboard.`
            }
        },

        banUser: async (guildId: Snowflake, userId: Snowflake) => {
            const data = await Starboard.findById(guildId)

            if (data.banned_users.includes(userId)) {
                let idx = data.banned_users.indexOf(userId)
                data.banned_users.splice(idx, 1)
                await data.save()
            } else {
                data.banned_users.push(userId)
                await data.save()
            }

            const users = this.getData(guildId)?.options.bannedUsers
            if (users.includes(userId)) {
                let idx = users.indexOf(userId)
                users.splice(idx, 1)
                return `<@${userId}> is no longer banned from the starboard.`
            } else {
                users.push(userId)
                return `<@${userId}> has been banned from the starboard.`
            }
        }
    }

    constructor(options: StarboardClientOptions) {
        this.client = options.client
        this.guilds = options.Guilds || []
        this.client.on('ready', () => this.cacheData())
    }

    public async start(client: Bot) {
        try {
            const data = await Starboard.find()
            this.config.set(
                data.map((d: any) => {
                    return {
                        id: d._id,
                        options: {
                            starCount: d.star_count,
                            starboardChannel: d.star_channel,
                            starEmote: d.star_emote,
                            bannedUsers: d.banned_users,
                            blacklistedChannels: d.blacklisted_channels
                        }
                    }
                })
            )
            client.logger.success(`Initialized ${data.length} starboards`)
        } catch (err) {
            client.logger.error(err)
        }
    }

    public validGuild(guild: Snowflake) {
        return this.guilds.some((x) => x.id === guild)
    }

    public async getConfig(guildId: Snowflake) {
        let data = this.getData(guildId)
        return data.options
    }

    public async listener(reaction: MessageReaction) {
        if (!this.validGuild) return
        if (reaction.message.partial) await reaction.message.fetch()
        if (reaction.partial) await reaction.fetch()

        await reaction.fetch()
        const { guildId, id } = reaction.message
        if (this.getData(guildId)?.options.blacklistedChannels.includes(reaction.message.channelId)) return
        if (
            reaction.count < this.getData(guildId)?.options.starCount ||
            reaction.emoji.name !== this.getData(guildId)?.options.starEmote
        ) return

        if (reaction.users.cache) await reaction.users.fetch()

        // Ignore messages from banned users
        if (this.getData(guildId).options.bannedUsers.includes(reaction.message.author.id)) return

        let count = 0
        // Do not count users who are banned
        reaction.users.cache.map((usr) => {
            if (!this.getData(guildId).options.bannedUsers.includes(usr.id))
                count++
        })
        if (count < this.getData(guildId)?.options.starCount) return

        const data = this.cache.get(guildId) || []
        const starboardChannel = this.client.channels.cache.get(
            this.guilds.find((x) => x.id === guildId)?.options.starboardChannel
        ) as TextChannel
        const getMessage = data.find((x) => x.origin === id)
        const generateEdit = this.generateEdit(count, reaction.message as Message)

        const sendMessage = () => {
            starboardChannel?.send(generateEdit).then((m) => {
                this.cache.set(reaction.message.guildId, [
                    ...data,
                    { id: m.id, origin: reaction.message.id }
                ])
            })
        }

        if (getMessage) {
            starboardChannel.messages
                .fetch(getMessage.id)
                .then((publishedMessage) => {
                    publishedMessage.edit(generateEdit)
                })
                .catch(sendMessage)
        } else sendMessage()
    }

    private cacheData() {
        this.guilds.forEach(async (guild) => {
            const channel = this.client.channels.cache.get(
                guild.options.starboardChannel
            ) as TextChannel
            if (!channel) return

            const messages = await channel.messages.fetch({ limit: 100 })
            if (!messages) return

            const value = messages.reduce(
                (accumulator: starMessageData[], message) => {
                    if (
                        message.author.id !== this.client.user.id ||
                        message.embeds.length === 0 ||
                        message.embeds[0].footer === null
                    ) return accumulator

                    const starCount = message.embeds[0].footer.text.match(/\d+/)?.[0]
                    const origin = message.embeds[0].footer.text.match(/(?!\()\d+(?=\))/)?.[0]

                    if (!starCount || !origin) return accumulator

                    const data: starMessageData = {
                        id: message.id,
                        origin
                    }
                    return [...accumulator, data]
                },
                []
            )
            this.cache.set(guild.id, value)
        })
    }

    private getData(guildId: Snowflake) {
        return this.guilds.find((x) => x.id === guildId)
    }

    private generateEdit(starCount: number, message: Message): MessageOptions {
        interface Data {
            content: string,
            imageURL: string,
        }

        let data: Data = {
            content: '',
            imageURL: ''
        }

        if (message.content.length < 3900) {
            data.content = message.content
        } else {
            data.content = `${message.content.substring(0, 3920)} **[ ... ]**`
        }
        data.content += `\n\n→ [original message](${message.url}) in <#${message.channelId}>`

        if (message.embeds.length) {
            const images = message.embeds
                .filter(embed => embed.thumbnail || embed.image)
                .map(embed => (embed.thumbnail) ? embed.thumbnail.url : embed.image.url)
            data.imageURL = images[0]
        } else if (message.attachments.size) {
            data.imageURL = message.attachments.first().url
            data.content += `\n📎 [${message.attachments.first().name}](${message.attachments.first().proxyURL})`
        }

        let embed = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
            .setColor(this.client.colors.purple)
            .setDescription(data.content)
            .setImage(data.imageURL)
            .setFooter(`${starCount} ⭐ (${message.id}) • ${message.createdAt.toLocaleDateString()}`)

        return { embeds: [embed] }
    }
}
