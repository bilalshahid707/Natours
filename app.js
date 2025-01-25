const rateLimiter = require('express-rate-limit')
const sanitizer =  require("express-mongo-sanitize")
const morgan = require('morgan');
const path = require('path')
const cookieParser = require('cookie-parser')

const globalErrorHandler = require("./controllers/errorControllers")
const AppError = require('./utils/appError')
const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const express = require('express');
const { base } = require('./models/userModel');
const app = express();
app.set("view engine","pug")
app.set("views",path.join(__dirname,'views'))


if (process.env.NODE_ENV="development"){
    app.use(morgan('dev'))
}

// MIDDLEWARES
app.use(express.static(path.join(__dirname, 'public')));
// Set Rate Limiting
const limiter = rateLimiter({
    windowMS:15*60*1000,
    limit:100,
    message:"Please try again after 15 minutes",
    statusCode:429
})
app.use(limiter)

// Body Parser
app.use(express.json())
app.use(cookieParser())

// Data Sanitization
app.use(sanitizer())

app.use("/",viewRouter)
app.use("/api/v1/tours",tourRouter)
app.use("/api/v1/users",userRouter)
app.use("/api/v1/reviews",reviewRouter)
app.use("/api/v1/bookings",bookingRouter)

app.all("*",(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server`,404))
})

app.use(globalErrorHandler)
module.exports = app