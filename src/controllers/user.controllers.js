import {asyncHandler} from "../utils/asyncHandler.js";
import {apiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"

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
})

export {registerUser}