import { model, Schema, Document } from 'mongoose'

export interface discordChannel extends Document {
    _id: string
    guildID: string
    followed_channels: string[]
}

export const discordChannelSchema = new Schema(
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

export default model<discordChannel>('discordChannel', discordChannelSchema)
