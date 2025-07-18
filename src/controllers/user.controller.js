import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";
import sendEmail from "../utils/Email.js"
import crypto from "crypto";
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, username, password, phoneno } = req.body;
  console.log(req.body);
  if (phoneno == null) {
    throw new ApiError(400, "Phone no is required");
  }
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phoneno,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    createdUser._id
  );

  const loggedInUser = await User.findById(createdUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
  // const options = {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "none",
  // };

  // return res
  //   .status(201)
  //   .cookie("accessToken", accessToken, options)
  //   .cookie("refreshToken", refreshToken, options)
  //   .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;
  console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  console.log(req.body);
  if (JSON.stringify(req.body) === "{}") {
    throw new ApiError(
      400,
      "Email | FullName | phoneno Required to Update Profile "
    );
  }
  console.log(req.body);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: req.body,
    },
    { new: true }
  ).select("-password -refreshToken");
  console.log(await User.findByIdAndUpdate(req.user?._id));
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const productImageLocalPath = req?.files[0]?.buffer;

  if (!productImageLocalPath) {
    throw new ApiError(400, "product image file is missing");
  }
  const productImage = await uploadImageToCloudinary(productImageLocalPath);
  if (!productImage.url) {
    throw new ApiError(400, "Error while uploading on Product image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: productImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  //TODO: delete old image - assignment

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const allProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate({
    path: "createdBy",
    select: "fullName username",
  });

  //console.log(products);
  return res
    .status(200)
    .json(new ApiResponse(200, products, "All product Fected Succesfully"));
});

const allProductsLimitpage = asyncHandler(async (req, res) => {
  const page = parseInt(req.params.id);
  const limit = 10; // Set a default limit if not provided

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const products = await Product.find({})
    .populate({
      path: "createdBy",
      select: "fullName username",
    })
    .skip(startIndex)
    .limit(limit);

  const totalProducts = await Product.countDocuments({});

  const pagination = {
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: page,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { products, pagination },
        "All products fetched successfully"
      )
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;


    const user=await User.findOne({email});
    if(!user){
        throw new ApiError(404,"User not found");
    }
    const resetToken=user.generatePasswordResetToken(); 
    await user.save();  

    const ResetUrl='http://'+req.get('origin')+'/reset-password/'+resetToken;
    
    const message=`Please click on the link to reset your password: ${ResetUrl}`;
    await sendEmail({
        email:user.email,
        subject:"Reset Password Link",
        message,
    })

    return res.status(200).json(new ApiResponse(200,{},"Reset token generated successfully"));
    
})

const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken, password } = req.body;
    console.log(resetToken,password);

    const hashedToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    const user=await User.findOne({resetToken:hashedToken,resetTokenExpiry:{$gt:Date.now()}});
    console.log(user);
    if(!user){
        throw new ApiError(404,"User not found");
    }
    user.password=password;
    user.resetToken=undefined;
    user.resetTokenExpiry=undefined;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,{user},"Password reset successfully"));
    
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  allProducts,
  allProductsLimitpage,
  forgotPassword,
  resetPassword,
};
