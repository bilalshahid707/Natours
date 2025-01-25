const mongoose = require("mongoose")
const slugify = require("slugify")
const User =require("./userModel")
const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Tour must have a name"],
        unique:true,
        trim:true
    },
    slug:String,
    duration:{
        type:Number,
        required:[true, "Tour must have a price"]
    },
    maxGroupSize:{
        type:Number,
        required:[true,"Tour must  have max group size"]
    },
    difficulty:{
        type:String,
        required:[true,"Tour must have a difficulty level"],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
          }
    },
    ratingsAverage:{
        type:Number,
        default:4.5
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,"tour must have a price"]
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                return val<this.price

            },
            message:"Discount price must be less than original price"
        }
    },
    summary:{
        type:String,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,"A tour must have a cover image"],
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation:{
        type:{
            type:String,
            default:"Point",
            enum:["Point"]
        },
        coordinates: [Number],
        address:String,
        description:String
    },
    locations:[
        {
            type:{
                type:String,
                default:"Point",
                enum:["Point"]
            },
            coordinates: [Number],
            address:String,
            description:String,
            day:Number
        }
    ],
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"users"
        }
    ],
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

tourSchema.index({price:1, ratingsAverage:-1})
tourSchema.index({startLocation:"2dsphere"})
// DOCUMENT MIDDLEWARE
tourSchema.pre("save",function(next){
    this.slug=slugify(this.name,{lower:true})
    next()
})

// QUERY MIDDLEWARE
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}})
    this.find().populate({
        path:"guides",
        select:"-__v -passwordChangedAt"
    })
    next()
})

// Virtual Populating Reviews
tourSchema.virtual("reviews",
    {
        ref:"reviews",
        foreignField:"tour",
        localField:'_id',
    }
)
// AGGREGATION MIDDLEWARE
// tourSchema.pre("aggregate",function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
//     next()
// })
const Tour = mongoose.model("tours",tourSchema)

module.exports=Tour