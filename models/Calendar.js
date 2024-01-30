// calendarModel.js

const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description:{
        type:String,
      
    },
    image:{
        type:String,
    },
    date: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Calendar = mongoose.model('Calendar', calendarSchema);
module.exports = Calendar;
