const mongoose = require("mongoose");



//social media scheme
const socialMediaDetailsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    image: {
        type: String,
    },
    facebook: {
        type: String,
    },
    instagram: {
        type: String,
    },
    youtube: {
        type: String,
    },
    position: {
        type: String,
    } 
})
 
const socialMediaSchema = new mongoose.Schema({
    category: {
        type: String,
    },
    socialMediaSchema:[socialMediaDetailsSchema]
})

const SocialMedia = mongoose.model("SocialMedia", socialMediaSchema);
module.exports = SocialMedia;