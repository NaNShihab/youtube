import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/fileUpload.js"

const registerUser = asyncHandler(async (req, res) => {
    // getting user inputs
    const {username, email, password, fullname} = req.body;

    // validation: not empty
    if([fullname, email, username, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    // checking if the user exists or not
    const existedUser = await User.findOne({
        $or: [
            {username},
            {email}
        ]
    })

    if(existedUser) {
        throw new ApiError(409, "User might be existed")
    }

    // checking for image and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // checking required avatar
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // uploading avatar and coverImage to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // creating user object and entering in database
    const user = await User.create({
        email,
        username: username.toLowerCase(),
        fullname,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    // removing password and refreshToken from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    // checking if user created successfully
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong")
    }

    // returning response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})

export {registerUser}