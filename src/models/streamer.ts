import { model, Schema, Model, Document } from 'mongoose'

interface streamer extends Document {
    _id: string
    channel_id: string
    profile_picture: string
    current_state: Boolean
}

const streamerSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        channel_id: {
            type: String,
            required: true,
        },
        profile_picture: {
            type: String,
            required: true,
        },
        current_state: {
            type: Boolean,
            required: true,
        },
    },
    { timestamps: true }
)

const Streamer: Model<streamer> = model('streamer', streamerSchema)

module.exports = Streamer
