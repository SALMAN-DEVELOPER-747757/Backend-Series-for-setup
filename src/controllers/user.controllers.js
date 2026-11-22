
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Api.Response.js";

const registerUser = asyncHandler(async (req, res) => {

    // 1. Get user details from frontend
    const { fullName, email, username, password } = req.body;

    console.log("Registration Data:", req.body);

    // 2. Validate required fields
    if ([fullName, email, username, password].some(
        (field) => !field || field.trim() === ""
    )) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(
            409,
            "User with this email or username already exists"
        );
    }
   //  console.log(req.files);
    

    // 4. Get avatar and cover image paths
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
   //  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;


    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    // 5. Check avatar
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 6. Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar || !avatar.url) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // 7. Upload cover image if provided
    let coverImage = null;

    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    // 8. Create user in MongoDB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // 9. Find created user without password and refresh token
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // 10. Check user creation
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    // 11. Return response
    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );

});

export { registerUser };
