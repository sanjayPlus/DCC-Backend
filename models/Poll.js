const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  title:String,
    options:[{
        option:String,
        votes:{
            type:Number,
            default:0
        
        },
        users:Array,
    }],
    users:Array,
});

const Poll = mongoose.model('Poll', PollSchema);
module.exports = Poll;