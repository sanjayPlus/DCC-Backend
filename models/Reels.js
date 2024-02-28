// galleryModel.js

const mongoose = require('mongoose');

const ReelsSchema = new mongoose.Schema({
    name: {
        type: String,
      
    },
    description:{
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

const Reels = mongoose.model('Reels', ReelsSchema);
module.exports = Reels;
