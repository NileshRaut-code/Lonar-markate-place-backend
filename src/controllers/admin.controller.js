import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

import { ObjectId } from "mongodb";

const allSellerData = asyncHandler(async (req, res) => {
  const Data = await User.find({ role: "SELLER" }).select(
    "-password -refreshToken"
  );
  if (Data == null) {
    throw new ApiError(404, "No Seller are There");
  }
  return res.json(
    new ApiResponse(
      200,
      {
        Data,
      },
      "List of All Seller"
    )
  );
});

const allUserData = asyncHandler(async (req, res) => {
  const Data = await User.find({ role: "USER" }).select(
    "-password -refreshToken -phoneno -username -email -coverImage -products"
  );
  if (Data == null) {
    throw new ApiError(404, "No Seller are There");
  }
  //   console.log(Data);
  return res.json(
    new ApiResponse(
      200,
      {
        Data,
      },
      "List of All Seller"
    )
  );
});
const oneSellerData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(404, "user not Found");
  }
  const _id = new ObjectId(id);
  const userData = await User.findOne({
    $and: [{ _id: _id }, { role: "SELLER" }],
  }).select("-password -refreshToken");
  if (!id) {
    throw new ApiError(404, "not Found");
  }
  return res.json(
    new ApiResponse(
      200,
      {
        userData,
      },
      "SELER is here"
    )
  );
});

const oneUserData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(404, "user not Found");
  }
  const _id = new ObjectId(id);
  const userData = await User.findOne({
    $and: [{ _id: _id }, { role: "USER" }],
  }).select("-password -refreshToken");
  if (!id) {
    throw new ApiError(404, "not Found");
  }
  return res.json(
    new ApiResponse(
      200,
      {
        userData,
      },
      "USER is here"
    )
  );
});

const changeRole = asyncHandler(async (req, res) => {
  const id = req.body.id;
  const change_role = req.body.change_role;
  //   console.log(id, change_role);
  if (!id && !change_role) {
    throw new ApiError(400, "All Field Required to change Role");
  }
  //   const { id, change_role } = res.body;

  const _id = new ObjectId(id);
  //console.log(someid);
  const isuser = await User.findOne({ _id: _id });
  if (!isuser) {
    throw new ApiError(400, "User / Seller is not Exist");
  }
  const updatingData = await User.updateOne(
    { _id: _id },
    { $set: { role: change_role } }
  );
  const updateData = await User.findOne({ _id: _id }).select(
    "-password -refreshToken"
  );
  return res.json(
    new ApiResponse(200, { updateData }, "Role Succesfully Changed")
  );
});

export { allSellerData, allUserData, oneSellerData, oneUserData, changeRole };
