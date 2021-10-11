import { model, Schema, Document } from 'mongoose'

export interface guild extends Document {
    _id: string
    music_channel: string
    lookup_nsfw: boolean
    log_blacklist: string[]
    log_ban: string[]
    log_voice: string[]
    log_message_delete: string[]
    log_message_edit: string[]
    stream_ping: boolean
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
            required: false,
        },
        log_ban: {
            type: [String],
            required: false,
        },
        log_voice: {
            type: [String],
            required: false,
        },
        log_message_delete: {
            type: [String],
            required: false,
        },
        log_message_edit: {
            type: [String],
            required: false,
        },
        stream_ping: {
            type: Boolean,
            required: false,
        },
    },
    { timestamps: true }
)

export default model<guild>('guild', guildSchema)
