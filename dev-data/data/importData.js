const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const mongoose = require("mongoose")
const fs = require('fs')
const review = require('../../models/reviewModel')
const DB = process.env.DATABASE.replace("<PASSWORD>",process.env.MONGO_PASS)

// CONNECTING TO DATABASE
mongoose.connect(DB,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:false
}).then(
    console.log("DB connection successfull")
)

const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,"utf-8"))


const importData = async()=>{
    try{
        await review.create(reviews)
    } catch(err){
        console.log(err)
    }
    process.exit()
}
const deleteData = async()=>{
    try{
        await review.deleteMany()
    }catch(err){
        console.log(err)
    }
    process.exit()
}

if (process.argv[2]=="--import"){
    importData()
} else if (process.argv[2]=="--delete"){
    deleteData()
}
