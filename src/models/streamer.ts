import { Document, model, Schema } from 'mongoose'

export interface streamer extends Document {
    _id: string
    channel_id: string
    profile_picture: string
    current_state: Boolean
}

export const streamerSchema = new Schema(
    {
        _id: {
            type: String,
            required: true
        },
        channel_id: {
            type: String,
            required: true
        },
        profile_picture: {
            type: String,
            required: true
        },
        current_state: {
            type: Boolean,
            required: true
        }
    },
    { timestamps: true }
)

export default model<streamer>('streamer', streamerSchema)
