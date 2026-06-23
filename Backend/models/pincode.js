const mongoose = require('mongoose')

const pinSchema = new mongoose.Schema({
    pincode :{
        type : Number,
        required : true,
        unique: true
    },
    available :{
        type : Boolean,
        require : true,
        default: true
    }
}, { timestamps: true })

const  PINcode = mongoose.model('PinCode' , pinSchema);

module.exports = PINcode