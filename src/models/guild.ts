import { model, Schema, Document } from 'mongoose'

export interface guild extends Document {
    _id: string
    music_channel: string
    log_channel: string
    log_channel_edit: Boolean
    log_message_delete: Boolean
    log_message_edit: Boolean
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
        log_channel_edit: {
            type: Boolean,
            required: false
        },
        log_message_delete: {
            type: Boolean,
            required: false
        },
        log_message_edit: {
            type: Boolean,
            required: false
        }
    },
    { timestamps: true }
)

export default model<guild>('guild', guildSchema)
