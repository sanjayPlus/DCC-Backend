// developerModel.js

const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
    name: {
        type: String,
      
    },
    position:{
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

const Developer = mongoose.model('developer', developerSchema);
module.exports = Developer;
