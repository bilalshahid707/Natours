const Tour = require('../models/tourModel');
const factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
////////////////////////////////////////// ROUTE HANDLERS //////////////////////////////////////////////////////
// Uploading Tour Images and multer configuration
const storage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only images can be uploaded', 400), false);
  }
};
const upload = multer({ storage: storage, fileFilter: multerFilter });

// Middlewares

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// Uploading Images
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover && !req.files.images) return next();
  req.body.imageCover = `tour-${req.params.id}.jpeg`
  // Cover image
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  // req.body.imageCover=imageCoverName
  // Images
  req.body.images=[]
  for (let i=0;i<req.files.images.length;i++){
    const imageName = `tour-${req.params.id}-${i+1}.jpeg`
    req.body.images.push(imageName)
    await sharp(req.files.images[i].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`public/img/tours/${imageName}`);
  }
  next()
});

exports.updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    data: tour,
  });
});

exports.topFive = async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  next();
};

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        numRatings: { $sum: '$ratingsQuantity' },
        totalTours: { $count: {} },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $count: {} },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: plan,
  });
});

exports.toursWithin = catchAsync(async (req, res, next) => {
  const { distance, latLon, unit } = req.params;
  const [lat, lon] = latLon.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: tours,
  });
});
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latLon, unit } = req.params;
  const [lat, lon] = latLon.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [Number(lon), Number(lat)] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
        includeLocs: 'Location',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        distance: 1,
        Location: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: tours,
  });
});


