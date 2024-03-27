// galleryModel.js

const mongoose = require('mongoose');

const soundSchema = new mongoose.Schema({
    title: {
        type: String,
      
    },
    url:{
        type:String,
    },
    sound: {
        type: String,
    },
    description:{
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Sound = mongoose.model('Sound', soundSchema);
module.exports = Sound;
