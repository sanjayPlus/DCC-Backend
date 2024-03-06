// galleryModel.js

const mongoose = require('mongoose');

const videoGallerySchema = new mongoose.Schema({
    title: {
        type: String,
      
    },
    url:{
        type:String,
    },
    video: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const VideoGallery = mongoose.model('VideoGallery', videoGallerySchema);
module.exports = VideoGallery;
