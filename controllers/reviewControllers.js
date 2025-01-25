const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory')


// Middlewares
exports.createReview = factory.createOne(Review)
exports.getAllReviews = catchAsync(async (req,res,next)=>{
    const reviews = await Review.find({tour:req.params.id})
    if (!reviews){
        return next(new AppError("No reviews yet",404))
    }
    res.status(200).json({
        status:"success",
        data:reviews
    })
})
exports.setIds=catchAsync(async (req,res,next)=>{
    if (!req.body.tour) req.body.tour=req.params.id
    if(!req.body.user) req.body.user=req.user.id
    next()
})
exports.updateReview = catchAsync(async (req,res,next)=>{
    const updatedReview = await Review.findByIdAndUpdate(req.params.id,req.body)
    res.status(201).json({
        status:"success",
        data:updatedReview
    })
})