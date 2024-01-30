// mandalamModel.js

const mongoose = require('mongoose');

const mandalamSchema = new mongoose.Schema({
    mandalam: {
        type: String,
        required: true,
    },
});

const Mandalam = mongoose.model('Mandalam', mandalamSchema);
module.exports = Mandalam;
