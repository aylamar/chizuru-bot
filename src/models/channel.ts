import { model, Schema, Model, Document } from 'mongoose'

interface discordChannel extends Document {
    _id: string,
    followed_channels: string[]
}

const discordChannelSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    followed_channels: {
        type: [String],
        required: true
    }
}, { timestamps: true })

const DiscChannel: Model<discordChannel> = model('discChannel', discordChannelSchema)

module.exports = DiscChannel