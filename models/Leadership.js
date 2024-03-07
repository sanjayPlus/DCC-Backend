// leadershipModel.js

const mongoose = require('mongoose');

const leadershipSchema = new mongoose.Schema({
    name: {
        type: String,
      
    },
    address:{
        type:String,
    },
    image: {
        type: String,
    },
    postion: {
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

const Leadership = mongoose.model('leadership', leadershipSchema);
module.exports = Leadership;
