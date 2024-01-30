// CarouselModel.js

const mongoose = require('mongoose');

const CarouselSchema = new mongoose.Schema({
  image: {
    type: String,
  },
    href:{
        type:String,
    },
    name:{
        type:String,
    },
});

const Carousel = mongoose.model('Carousel', CarouselSchema);
module.exports = Carousel;
