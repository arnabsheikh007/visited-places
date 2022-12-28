const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const req = require('express/lib/request');



const getUsers = async (req,res,next) =>{

    let users;
    try{
        users = await User.find({},'-password');
    }catch(err){
        const error = new HttpError("Something Went Wrong",500);
        return next(error);
    }

    res.json( {users : users.map(user => user.toObject({getters:true})) } );
    
};




const signup = async (req,res,next) =>{

    const error = validationResult(req);
    if(!error.isEmpty()){
        return next ( new HttpError('Invalid Inputs', 422) );
    }

    const {name,email,password} = req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({email : email});
    }catch(err){
        const error = new HttpError("Something Went Wrong",500);
        return next(error);
    };
    
    if(existingUser){
        return next (new HttpError("Email Already Exist!,Please Login instead",422) );
    }

    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password,12);
    }catch(err){
        return next( new HttpError("Couldn't create user",500));
    }
    
    
    const createdUser = new User({
        name,
        email,
        image : req.file.path ,
        password : hashedPassword,
        places : []
    });

    try{
        await createdUser.save();
    }catch(err){
        const error = new HttpError("Sign Up Failed",500);
        return next(error);
    };

    let token;
    try{
        token = jws.sign(
            {userId: createdUser.id , email: createdUser.email},
            'Secret_string',
            {expiresIn : '1h'}
        );
    }catch(err){
        const error = new HttpError("Sign Up Failed",500);
        return next(error);
    }

    res.status(201).json({userId :createdUser.id , email: createdUser.email, token:token });
};



const login =async (req,res,next) =>{
    const {email,password} = req.body;

    let existingUser;    
    try{
        existingUser = await User.findOne({email : email});
    }catch(err){
        const error = new HttpError("Something Went Wrong",500);
        return next(error);
    };

    if(!existingUser){
        return next (new HttpError("Couldn't Identify User. Wrong Credential",401) );
    }

    let isValidPassword = false;
    try{
        isValidPassword = await bcrypt.compare(password,existingUser.password)
    }catch(err){
        return next( new HttpError("Couldn't logged in. Please check Credentials!",500) );
    }
    
    if(!isValidPassword){
        return next( new HttpError("Invalid Credentials",401) );
    }

    let token;
    try{
        token = jws.sign(
            {userId: existingUser.id , email: existingUser.email},
            'Secret_string',
            {expiresIn : '1h'}
        );
    }catch(err){
        const error = new HttpError("log in Failed",500);
        return next(error);
    }

    res.json({userId : existingUser.id , email : existingUser.email, token: token});

};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;