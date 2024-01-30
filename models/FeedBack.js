// feedbackModel.js

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  feedback: {
    type: String,
  },
  userId: {
    type: String,
  },
  rating:{
    type:Number,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
