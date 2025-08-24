import {asyncHandler} from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (res ,req) =>{
    
    // get user detail from frontend
    // validation - not empty
    // check if user already exists: username ,email
    // check for images , check for avatar.
    // upoad hem to cloudinary, avatar
    // craete user object - create entry in db
    // password remove and refresh token field response
    // check for user creation 
    // return res

    const {fullName, email, userName, password }= req.body
    console.log("email: ", email);

})

export {
    registerUser,
}