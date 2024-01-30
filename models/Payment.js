// PaymentModel.js

const mongoose = require('mongoose');

// paymentSchema.js
const paymentSchema = new mongoose.Schema({
   userId:String,
   amount:Number,
   body:Object,
   name:String,
   email:String,
   phone:String,
   date:String,
   merchantId:String,
   merchantTransactionId:String,
   district:String,
   assembly:String,
   local:String,
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
