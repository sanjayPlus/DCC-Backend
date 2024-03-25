const mongoose = require("mongoose");
const DailyNewsSchema = new mongoose.Schema({
    image:{
        type: String
    },
    title:{
        type: String
    },
    news:{
        type: String
    },
    link:{
        type: String
    },
    optional:{
        type: String
    },
    date:{
        type: String
    }
});

const DailyNews = mongoose.model("DailyNews", DailyNewsSchema);
module.exports = DailyNews;