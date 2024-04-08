// CarouselModel.js

const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  image: {
    type: String,
  },
   
  description:{
        type:String,
    },
    title:{
        type:String
    },
});

const History = mongoose.model('History', HistorySchema);
module.exports = History;
