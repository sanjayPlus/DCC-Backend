const mongoose = require("mongoose");
const SwingSchema = new mongoose.Schema({
    swing: {
        type: String,
        required: true
    }
});
const Swing = mongoose.model("Swing", SwingSchema);
module.exports = Swing;