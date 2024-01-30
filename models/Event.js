// eventModel.js

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
      
    },
    description:{
        type:String,
    },
    url:{
        type:String,
    },
    image: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
