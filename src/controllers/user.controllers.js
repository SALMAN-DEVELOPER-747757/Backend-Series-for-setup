import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/Api.Response.js";

const registerUser=asyncHandler( async(req,res)=>{
 //get user details from frontend 
 //validation will not empty
 //check if user already exists :username,email
 //check for images and avatar
 //upload them to cloudinary ,avatar
 //create user object -create entry in DB
 //remove password and refresh token fields from response
 //check for user creation
 //return response
 const {fullName,email,username,password}=req.body
 console.log("Email:",email);

//  if (fullName==="") {
//     throw new apiError(400,"fullName is required ")
//  }
if ([fullName,email,username,password].some((field)=>
field?.trim()==="")) 
{
    throw new apiError(400,"All field are required")
}
   const existedUser=User.findOne({
    $or:[{username},{email}]
   })

 if(existedUser){
    throw new ApiError(409,"user with email or username already exists")
 }

 const avatarLocalPath= req.files?.avatar[0]?.path;
 const coverImageLocalPath=req.files?.coverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar files is required")
}
 const avatar=await uploadOnCloudinary(avatarLocalPath)
 const coverImage=await uploadOnCloudinary
 (coverImageLocalPath)

 if(!avatar){
    throw new ApiErro(400,"Avatar files is Required")
 }

 const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url ||"",
    email,
    password,
    username:username.toLowerCase()
 })
 const createdUser= await User.findById(User._id).select(
  "-password -refreshToken")

  if(!createdUser){
   throw new ApiError(500,"something went wrong while registering the user")
}
return res.status(201).json(
   new ApiResponse(200,createdUser,"user registered successfully")
)
})

export {registerUser}