const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync")
const APIFeatures = require('../utils/apiFeatures')


// Middlewares
exports.createOne = Model =>{
    return catchAsync(async (req, res) => {
        console.log(req.files)
        const document = await Model.create(req.body);
        res.status(201).json({
          status: 'success',
          data: document,
        });
      
    });
}
exports.getOne = (Model,populateObject)=>{
    return catchAsync(async (req, res,next) => {
        const document = await Model.findById(req.params.id).populate(populateObject);
        
        if (!document) {
          return next(new AppError('No document found with that ID', 404));
        }
        res.status(200).json({
          status: 'success',
          data: {
            document,
          },
        });
    });
}
exports.getAll = Model =>{
  return catchAsync(async (req, res) => {
    let query = await Model.find();
    const API = new APIFeatures(query, req.query,Model)
      .filter()
      .limitFields()
      .limitToTopFive()
      .pagination()
      .sort();
    // EXECUTING QUERY
    const documents = await API.query;
    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: documents,
      
    });
  
});
}
exports.deleteOne = Model=>{
    return catchAsync(async (req, res,next) => {
        const document = await Model.findByIdAndDelete(req.params.id);
        if (!document){
            return next(new AppError(`No ${Model} found`,404))
        }
        res.status(200).json({
          status: 'success',
          data: null,
        });
    });
}
