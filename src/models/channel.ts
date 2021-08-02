const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discChannelSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    followed_channels: {
        type: [String],
        required: true
    }
}, { timestamps: true })

const DiscChannel = mongoose.model('discChannel', discChannelSchema)

module.exports = DiscChannel