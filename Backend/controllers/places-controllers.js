const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordinatesForAddress = require('../util/location');

const Place = require('../models/place');
const User = require('../models/user');
const { populate } = require('../models/place');


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; 
  let place;
  try{
    place = await Place.findById(placeId);
  }catch(err ){
      const error = new HttpError("Something Went Wrong",500);
      return next(error);
  };

  if (!place) {
    return next(new HttpError('Could not find a place for the provided id.', 404));
  }

  res.json({ place : place.toObject({getters : true}) }); 
};





// const getPlacesByUserId = async (req, res, next) => {
//   const userId = req.params.uid;

//   let places;
//   try{
//     places = await Place.find({creator:userId});
//   }catch(err ){
//       const error = new HttpError("Something Went Wrong",500);
//       return next(error);
//   };

//   if (!places || places.length === 0 ) {
//     return next(
//       new HttpError('Could not find a place for the provided user id.', 404)
//     );
//   }

//   res.json({ places : places.map(place => place.toObject({getters:true})) });
// };
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlace;
  try{
    userWithPlace = await User.findById(userId).populate('places');
  }catch(err ){
      const error = new HttpError("Something Went Wrong",500);
      return next(error);
  };

  if (!userWithPlace || userWithPlace.places.length === 0 ) {
    return next(
      new HttpError('Could not find a place for the provided user id.', 404)
    );
  }

  res.json({ places : userWithPlace.places.map(place => place.toObject({getters:true})) });
};





const createPlace = async (req,res,next) =>{

  const error = validationResult(req);
  if(!error.isEmpty()){
    return next(new HttpError('Invalid Inputs', 422)) ;
  }

  const {title,description,address,creator} = req.body;
  
  let coordinates;
  try{
    coordinates = await getCoordinatesForAddress(address);
  }catch(error){
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location : coordinates,
    image: req.file.path,
    creator
  });

  let user;
  try{
    user = await User.findById(creator);
  }catch(err){
    const error = new HttpError("Place Creation Failed",500);
    return next(error);
  };
  
  if(!user){
    return next( new HttpError("Could't find user for provided ID",404))
  }
  
  try{
    const sess =await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session: sess});
    user.places.push(createdPlace);
    await user.save({session: sess});
    await sess.commitTransaction();
  }catch(err){
    const error = new HttpError("Place Creation Failed",500);
    return next(error);
  };
  
  res.status(201).json({place : createdPlace});
};






const updatePlace = async (req,res,next) =>{
  
  const error = validationResult(req);
  if(!error.isEmpty()){
    return next ( new HttpError('Invalid Inputs', 422) );
  }
  
  const {title,description} = req.body;
  const placeId = req.params.pid;
  
  let place;
  try{
    place = await Place.findById(placeId);
  }catch(err ){
    const error = new HttpError("Something Went Wrong",500);
    return next(error);
  };
  
  place.title = title;
  place.description = description;
  
  try{
    await place.save();
  }catch(err){
    const error = new HttpError("Something Went Wrong",500);
    return next(error);
  }
  res.status(200).json({place: place.toObject({getters : true})});
};





const deletePlace = async (req,res,next) =>{
  const placeId = req.params.pid;
  let place;
  try{
    place = await Place.findById(placeId).populate('creator');
  }catch(err ){
    const error = new HttpError("Something Went Wrong",500);
    return next(error);
  };
  
  if(!place){
    return next( new HttpError("Couldn't find place for this ID",404));
  }

  const imagePath = place.image;
  
  try{
    const sess =await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session :sess});
    place.creator.places.pull(place);
    await place.creator.save({session: sess});
    await sess.commitTransaction();
  }catch(err ){
    const error = new HttpError("Something Went Wrong",500);
    return next(error);
  };
  fs.unlink(imagePath , (err) => {
    console.log(err);
  });
  
  res.status(200).json({message : "Deleted"});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
