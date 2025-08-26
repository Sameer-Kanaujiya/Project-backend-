

import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req ,res) =>{  
    console.log("Body:", req.body);
    console.log("Files:", req.files); 
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

export {
    registerUser
}