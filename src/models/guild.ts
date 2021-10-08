import { model, Schema, Document } from 'mongoose'

export interface guild extends Document {
    _id: string
    music_channel: string
    lookup_nsfw: boolean
    log_blacklist: string[]
    log_message_delete: string[]
    log_message_edit: string[]
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
        lookup_nsfw: {
            type: Boolean,
            required: false,
        },
        log_blacklist: {
            type: [String],
            required: false
        },
        log_message_delete: {
            type: [String],
            required: false
        },
        log_message_edit: {
            type: [String],
            required: false
        }
    },
    { timestamps: true }
)

export default model<guild>('guild', guildSchema)
