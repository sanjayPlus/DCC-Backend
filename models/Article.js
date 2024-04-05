// galleryModel.js

const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    name: {
        type: String,
      
    },
    href:{
        type:String,
    },
    image: {
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

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
