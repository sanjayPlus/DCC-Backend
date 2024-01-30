// galleryModel.js

const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    name: {
        type: String,
      
    },
    href:{
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

const Ad = mongoose.model('Ad', adSchema);
module.exports = Ad;
