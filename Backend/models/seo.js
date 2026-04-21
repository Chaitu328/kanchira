
const mongoose = require("mongoose");

const seoSchema = new mongoose.Schema({
    metaSiteName : {
        type : String ,
    },
    metaTitle:{
        type : String ,
    },
    metaKeyword : {
        type : String ,
    },
    metaDescription :{
        type : String ,
    },
    metaLogo:{
        type:String
    }
})

const Seo = mongoose.model("seo" , seoSchema);

module.exports = Seo 