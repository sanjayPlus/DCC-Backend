const mongoose = require('mongoose');
const RepresentativesSchema = new mongoose.Schema({
    name: {
        type: String,
      
    },
    address:{
        type:String,
    },
    image: {
        type: String,
    },
    position: {
        type: String,
    },
    phone: {
        type: Array,
    },
    email: {
        type: Array,
    },
    category:{
        type:String,
    },
    link:{
        type:String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Representatives = mongoose.model('Representatives', RepresentativesSchema);
module.exports = Representatives;