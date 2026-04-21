const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  name: { type: String },
  code: { type: String, required: true },
  startDate:{
    type:Date,
    required:true
  },
  expiryDate:{
    type:Date,
    required:true
    
  },
  description:{
    type:String
  },
 status:{
    type:Boolean,
    default:true
 },
 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("offer", offerSchema);
