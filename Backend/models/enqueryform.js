const mongoose = require("mongoose");

const enquerySchema = new mongoose.Schema({
    fullName : {
        type : String ,
        required : true
    },
    email :{
        type : String ,
        required : true
    },
    phoneNumber : {
        type : String ,
        required : true
    },
    message :{
        type : String ,
        required : true
    }
})

const Enquery = mongoose.model("enqueryForm" , enquerySchema);

module.exports = Enquery 