import { model, Schema, Model, Document } from 'mongoose'

interface discordChannel extends Document {
    _id: string
    guildID: string
    followed_channels: string[]
}

const discordChannelSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        guild_id: {
            type: String,
            required: true,
        },
        followed_channels: {
            type: [String],
            required: true,
        },
    },
    { timestamps: true }
)

const DiscChannel: Model<discordChannel> = model('discordChannel', discordChannelSchema)

module.exports = DiscChannel
