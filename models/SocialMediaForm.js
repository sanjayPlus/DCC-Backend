const mongoose = require("mongoose");



//social media scheme
const socialMediaFormSchema = new mongoose.Schema({
    whatsapp: {
        type: String,
    },
    contact: {
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
    
})
 


const SocialMediaForm = mongoose.model("SocialMediaForm", socialMediaFormSchema);
module.exports = SocialMediaForm;