const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
    token: {
        type: String,
    },
    userId: {
        type: String,
    },
});
const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;