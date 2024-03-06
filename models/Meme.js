// galleryModel.js

const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
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

const Meme = mongoose.model('Meme', memeSchema);
module.exports = Meme;
