const mongoose = require('mongoose')

const pinSchema = new mongoose.Schema({
    pincode :{
        type : Number,
        required : true
    },
    available :{
        type : Boolean,
        require : true
    }
})

const  PINcode = mongoose.model('PinCode' , pinSchema);

module.exports = PINcode