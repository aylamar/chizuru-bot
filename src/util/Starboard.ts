import { Bot } from "../client/client"
import { Collection, Message, MessageEmbed, MessageReaction, MessageOptions, Snowflake, TextChannel } from "discord.js"
import starboard from "../models/starboard"
import { StarboardClientOptions, starMessageData, StarboardGuild } from "../interfaces/Starboard"

export class StarboardClient {
    public client: Bot
    public guilds: StarboardGuild[]
    public cache: Collection<Snowflake, starMessageData[]> = new Collection()

    constructor(options: StarboardClientOptions) {
        this.client = options.client
        this.guilds = options.Guilds || []
        this.client.on('ready', () => this.cacheData())
    }

    public async start (client: Bot) {
        try {
            const data = await starboard.find()
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
                        },
                    }
                })
            )
            client.logger.success(`Initialized ${data.length} starboards`)
        } catch (err) {
            client.logger.error(err)
        }
    }

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

        blacklistChannel: (guildId: Snowflake, channelId: Snowflake) => {
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

        banUser: (guildId: Snowflake, userId: Snowflake) => {
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
                    )
                        return accumulator

                    const starCount =
                        message.embeds[0].footer.text.match(/\d+/)?.[0]
                    const origin =
                        message.embeds[0].footer.text.match(/(?!\()\d+(?=\))/)?.[0]

                    if (!starCount || !origin) return accumulator

                    const data: starMessageData = {
                        id: message.id,
                        origin,
                    }
                    return [...accumulator, data]
                },
                []
            )
            this.cache.set(guild.id, value)
        })
    }

    public validGuild(guild: Snowflake) {
        return this.guilds.some((x) => x.id === guild)
    }

    private getData(guildId: Snowflake) {
        return this.guilds.find((x) => x.id === guildId)
    }

    private generateEdit(starCount: number, message: Message): MessageOptions {
        return {
            embeds: [
                new MessageEmbed()
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                    .setColor(this.client.colors.purple)
                    .setDescription(`${message.content}\n\n→ [original oessage](${message.url}) in <#${message.channelId}>`)
                    .setImage(message.attachments.first()?.url || null)
                    .setFooter(`${starCount} ⭐ (${message.id}) • ${message.createdAt.toLocaleDateString()}`),
            ],
        }
    }

    public async getConfig(guildId: Snowflake) {
        let data = this.getData(guildId)
        return data.options
    }

    public async listener(reaction: MessageReaction) {
        if (!this.validGuild) return
        if (reaction.message.partial) await reaction.message.fetch()
        if (reaction.partial) await reaction.fetch()
        const { guildId, id } = reaction.message
        if (this.getData(guildId)?.options.blacklistedChannels.includes(reaction.message.channelId)) return
        if (
            reaction.count < this.getData(guildId)?.options.starCount ||
            reaction.emoji.name !== this.getData(guildId)?.options.starEmote
        ) return

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
                    { id: m.id, origin: reaction.message.id },
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
}
