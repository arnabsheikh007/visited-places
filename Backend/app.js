const fs = require('fs');
const path = require('path')

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-routes');
const usersRoute = require('./routes/users-routes');

const app = express();

app.use(bodyParser.json());

app.use('/Uploads/images',express.static(path.join('Uploads','images')))

app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', '*' );
  res.setHeader(
    'Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next();
});

app.use('/api/places', placesRoutes); // => /api/places...
app.use('/api/users',usersRoute);

app.use((req,res,next) => {
    const error = new HttpError("Could not find this route.",404);
    throw error;
});

app.use((error, req, res, next) => {
  if(req.file){
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500)
  res.json({message: error.message || 'An unknown error occurred!'});
});


mongoose
  .connect('mongodb+srv://arnab:Arnab041@cluster0.aqtzl.mongodb.net/Places?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected');
    app.listen(5000);
  })
  .catch((error) =>{
    console.log('DB Connection Failed');
    console.log(error);
  })
