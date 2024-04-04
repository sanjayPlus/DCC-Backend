// sloganModel.js

const mongoose = require('mongoose');

const sloganSchema = new mongoose.Schema({
    slogan: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    title:{
        type:String,
    },
    author:{
        type:String,
    },
    event:{
        type:String,
    },
    
},{
    timestamps: true
});

const Slogan = mongoose.model('Slogan', sloganSchema);
module.exports = Slogan;
