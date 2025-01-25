const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
// Uploading User Images and multer configuration
const storage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only images can be uploaded', 400), false);
  }
};
const upload = multer({ storage: storage, fileFilter: multerFilter });

const filterObj = (obj, ...fields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
// Middlewares

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = factory.createOne(User);
exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.uploadUserPhoto = upload.single('photo');
exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`public/img/users/${req.file.filename}`);
  next()
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("You can't change the password", 401));
  }
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) {
    filterBody.photo = req.file.filename;
  }
  const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = User.findById(req.user.id);
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
  });
});
