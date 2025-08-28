

import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { SchemaTypeOptions } from "mongoose";

const generateAccessAndRefreshToken =async( userId) =>
{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false })

        return{ accessToken , refreshToken}
        
    } catch (error) {
        throw new ApiError (500 , "Something went wrong while generating and access token")
    }
    
}

const registerUser = asyncHandler( async (req ,res) =>{  
    //console.log("Files:", req.files); 
    //console.log("Body:", req.body);
    //res.status(200).json({
    //    message:"ok!!! all are good"
    //})
    // get user detail from frontend
    // validation - not empty
    // check if user already exists: username ,email
    // check for images , check for avatar.
    // upoad hem to cloudinary, avatar
    // craete user object - create entry in db
    // password remove and refresh token field response
    // check for user creation 
    // return res

    const {fullName, email, userName, password }= req.body;
    console.log("email: ", email);

    if (
        [fullName,email,userName,password].some((field)=>
        field?.trim()=== "")
    ) {
        throw new ApiError(400, "All Fields are required")
    }
    // check if user exists
    const existedUser = await User.findOne({
        $or: [{userName} ,{email}],
        
    })
    
    if (existedUser) {
        throw new ApiError(409,"User name or email already exit")
    }
    //console.log(req.files)
    const avatarLocalPath = req.files?.avatar?.[0]?.path.replace(/\\/g, "/");
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path.replace(/\\/g, "/");


    if (!avatarLocalPath ){
        throw new ApiError (400,"Avater file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage : coverImage?.url || "" ,
        password,
        email,
        userName :userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
//req body -> data
// username or email
//find the user
//password check
//access and refresh token
//send cookies


    const { email, userName, password } = req.body; // destructure सबसे पहले

    if (!userName && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
        $or: [{ userName: userName?.toLowerCase() }, { email: email?.toLowerCase() }]
    }).select("+password"); // password include

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Debug
    //console.log("Frontend password:", password);
    //console.log("DB password:", user.password);

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: true };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "User logged in successfully"
        ));
});



const logoutUser =asyncHandler(async (req ,res) => {
    await User.findByIdAndUpdate (req.user._id,
        {
            $set: {
                refreshToken:undefined
            }
        },
        {
            new:true 
        }
    )

    const option ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , option)
    .clearCookie("refreshToken" , option)
    .json(new ApiResponse (200 ,{} ,"User logged Out"))

})

const refreshAccessToken = asyncHandler( async(res, req ) =>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if( incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
    
        if (!user){
            throw new ApiError(401,"Invaild refresh token");
    
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401," refresh token is expired or used ");
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {acccessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken , options)
        .cookie("refreshtoken", newRefreshToken ,options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError( 401, error?.message || "Invaild refresh token")
        
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}