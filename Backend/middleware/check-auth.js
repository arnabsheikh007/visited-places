const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];

        if(!token){
            throw new Error('Authentication Failed')
        }
        const decodedTeken = jwt.verify(token,'Secret_string');

        req.userData = { userId: decodedTeken.userId }

        next();

    }catch(err){
        const error = new HttpError('Authentication Failed!' , 401);
        return next(error);
    }
};
