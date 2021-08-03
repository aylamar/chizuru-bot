import { model, Schema, Model, Document } from 'mongoose'

interface streamer extends Document {
    _id: string,
    profile_picture: string,
    offline_image: string,
    current_state: Boolean
}

const streamerSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    profile_picture: {
        type: String,
        required: true
    },
    offline_image: {
        type: String,
        required: true
    },
    current_state: {
        tyle: Boolean,
        required: true
    }

}, { timestamps: true })

const streamer: Model<streamer> = model('streamer', streamerSchema)

module.exports = streamer