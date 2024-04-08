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
    
    link:{
        type:String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const categoryRepresentativesSchema = new mongoose.Schema({
    category: {
        type: String,
    },
    representatives:[RepresentativesSchema]
})

const Representatives = mongoose.model('Representatives', categoryRepresentativesSchema);
module.exports = Representatives;