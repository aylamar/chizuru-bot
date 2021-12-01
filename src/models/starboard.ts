import { model, Schema, Document } from 'mongoose'

export interface Starboard extends Document {
    _id: string
    star_count: number
    star_emote: string
    star_channel: string
    banned_users: string[]
    blacklisted_channels: string[]
}

export const starboardSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    star_count: {
        type: Number,
        required: true,
    },
    star_emote: {
        type: String,
        required: true,
    },
    star_channel: {
        type: String,
        required: true,
    },
    banned_users: {
        type: [String],
        required: true,
    },
    blacklisted_channels: {
        type: [String],
        required: true,
    },
})

export default model<Starboard>('starboard', starboardSchema)
