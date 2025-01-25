const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'tours',
        required:[true,"Booking must belong to a tour"]
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'users',
        required:[true,'Booking must belong to user']
    },
    price:{
        type:Number,
        required:[true,'booking must have a price']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    paid:{
        type:Boolean,
        default:true
    }
})

bookingSchema.pre(/^find/,function(next){
    this.populate({
        path:'user'
    }).populate({
        path:'tour'
    })
    next()
})

const booking = mongoose.model('bookings',bookingSchema)
module.exports=booking