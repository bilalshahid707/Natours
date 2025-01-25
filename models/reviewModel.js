const mongoose = require('mongoose');
const Tour = require('./tourModel')
const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review cannot be empty'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'tours',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
  },
});

reviewSchema.index({tour:1,user:1},{unique:true})
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

reviewSchema.statics.avgRating = async function (tourId) {
  const stats = await this.aggregate([
    { $match:
     { tour: tourId }
     }, 
     { $group: 
      { _id: '$tour'  ,
      nRating:{$count:{}},
      avgRating:{$avg:"$rating"}
    },
    },
  ])
  await Tour.findByIdAndUpdate(tourId,{
    ratingsAverage:stats[0].avgRating,
    ratingsQuantity:stats[0].nRating
  })
};
reviewSchema.post("save",function(){
  this.constructor.avgRating(this.tour)
})
reviewSchema.pre(/^findOneAnd/,async function(next){
  this.document = await this.findOne()
  console.log(this)
  next()
})
reviewSchema.post(/^findOneAnd/,async function(){
  await this.document.constructor.avgRating(this.document.tour._id)
})
const review = mongoose.model('reviews', reviewSchema);
module.exports = review;
