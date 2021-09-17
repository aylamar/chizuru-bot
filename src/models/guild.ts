import { model, Schema, Document } from 'mongoose'

export interface guild extends Document {
    _id: string
    music_channel: string
    log_channel: string
}

export const guildSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        music_channel: {
            type: String,
            required: false,
        },
        log_channel: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
)

export default model<guild>('guild', guildSchema)
