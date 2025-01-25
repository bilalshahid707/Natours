const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const app = require('./app');
const mongoose = require("mongoose")
const DB = process.env.DATABASE.replace("<PASSWORD>",process.env.MONGO_PASS)

// CONNECTING TO DATABASE
mongoose.connect(DB,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:false
}).then(
    console.log("DB connection successfull")
)

const port = process.env.PORT  || 3000
const server = app.listen(port,()=>{
    // if (process.env.NODE_ENV="development"){
    //     process.env.NODE_ENV="production"
    // }
    console.log(`listening request on port ${port}`)
})

process.on("unhandledRejection",err=>{
    console.log(err.name,err.message)
    server.close(()=>{
        process.exit(1)
    })
})
process.on('uncaughtException',err=>{
    console.log(err.name)
})
