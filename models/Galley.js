// galleryModel.js

const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
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

const Gallery = mongoose.model('gallery', gallerySchema);
module.exports = Gallery;
