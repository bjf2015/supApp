var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    from: {
        type: Object,
        // mongoose specific : refers to something within the user collection
        ref: 'User',
        required: true
    },
    to: {
        type: Object,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    }
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
