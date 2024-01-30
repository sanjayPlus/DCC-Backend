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
});

const Slogan = mongoose.model('Slogan', sloganSchema);
module.exports = Slogan;
