import { model, Schema, Document } from 'mongoose'

export interface starboard extends Document {
    _id: string
    star_count: number
    star_emote: string
    star_channel: string
}

export const starboardSchema = new Schema(
    {
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
    },
)

export default model<starboard>('starboard', starboardSchema)