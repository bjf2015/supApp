var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema ({
    message: {
        type: String,
        required: true
    }
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
