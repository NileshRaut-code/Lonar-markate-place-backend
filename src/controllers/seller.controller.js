import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ObjectId } from "mongodb";
import { Review } from "../models/review.model.js";
import {
  uploadImageToCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
const allProducts = asyncHandler(async (req, res) => {
  const product_data = await Product.find({}).populate({
    path: "createdBy",
    select: "fullName",
  });

  res
    .status(200)
    .json(new ApiResponse(200, product_data, "all product fetched"));
});

const createProduct = asyncHandler(async (req, res) => {
  const createdBy = req.user._id;
  const { title, productdescription, price, availableStock } = req.body;
  if ([title, productdescription].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // const productImageLocalPath = req.file?.path;

  // if (!productImageLocalPath) {
  //   throw new ApiError(400, "product image file is missing");
  // }

  // const productImage = await uploadOnCloudinary(productImageLocalPath);

  // if (!productImage.url) {
  //   throw new ApiError(400, "Error while uploading on Product image");
  // }
  console.log(req.files[0]);
  const productImageLocalPath = req?.files[0]?.buffer;
  let productImage;

  if (!productImageLocalPath) {
    //i changed it only for vercel becoz cant stored into local
    // productImage = await uploadOnCloudinary(productImageLocalPath);
    throw new ApiError(400, "product image file is missing");
  }
  productImage = await uploadImageToCloudinary(productImageLocalPath);
  if (!productImage.url) {
    throw new ApiError(400, "Error while uploading on Product image");
  }
  console.log(productImage?.url);
  const newProduct = await Product.create({
    title,
    productdescription,
    price,
    availableStock,
    createdBy,
    //image: productImage.url || " ",
    image: productImage ? productImage.url : "",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newProduct, "New Product added successfully"));
});

const getShopProfile = asyncHandler(async (req, res) => {
  const username = req.params.username;
  console.log(req.params.username);
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const userdata = await User.findOne({ username: username }).select("_id");

  const userWithProducts = await User.aggregate([
    {
      $match: { _id: userdata._id, role: "SELLER" },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "createdBy",
        as: "products",
      },
    },
    {
      $project: {
        password: 0,
        refreshToken: 0,
      },
    },
  ]);

  console.log(userWithProducts);
  if (!userWithProducts) {
    throw new ApiError(404, "No Shop Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, userWithProducts, "Shop fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const product_id = req.params.productId;
  const { title, productdescription, price, Avaiblestock } = req.body;
  //   console.log(title, productdescription, price, Avaiblestock);

  //console.log(await Product.findOne({ _id: new ObjectId(productId) }));
  const updatedProduct = await Product.findByIdAndUpdate(
    {
      _id: new ObjectId(product_id),
    },
    {
      $set: {
        title,
        productdescription,
        price,
        Avaiblestock,
      },
    },
    { new: true }
  ).select();

  // console.log(await Product.findOne({ _id: new ObjectId(productId) }));

  console.log(updatedProduct);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product successfully Updated"));
});

const oneProduct = asyncHandler(async (req, res) => {
  const product_id = req.params.id;

  const product_data = await Product.findOne({ _id: new ObjectId(product_id) });
  if (!product_data) {
    throw new ApiError(404, "Product Does not Exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, product_data, "Product successfully fetched"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product_id = req.params.id;
  const product_data = await Product.findOne({ _id: new ObjectId(product_id) });
  if (!product_data) {
    throw new ApiError(404, "Product Does not Exist");
  }
  await Product.deleteOne({
    _id: new ObjectId(product_id),
  });
  return res
    .status(200)
    .json(new ApiResponse(200, "Product successfully Deleted"));
});

const updateShopProfile = asyncHandler(async (req, res) => {
  const { fullName, phoneno } = req.body;
  console.log(fullName, phoneno);

  const updatedProduct = await User.findByIdAndUpdate(
    req.user._id,

    {
      $set: {
        fullName,
        phoneno,
      },
    },
    { new: true }
  ).select("username fullName phoneno");

  // console.log(await Product.findOne({ _id: new ObjectId(productId) }));
  console.log(updatedProduct);
  if (!updatedProduct) {
    throw new ApiError(404, "Nothing has been Updated");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProduct, "Shop Details successfully Updated")
    );
});

const createComment = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const comment = req.body.comment;
  const rating = req.body.rating;
  console.log(req.body);
  if (!id || !comment || !rating) {
    throw new ApiError(200, "all feilds are require");
  }
  const productdata = await Product.findOne({ _id: new ObjectId(id) });
  if (!productdata) {
    throw new ApiError(404, "No Product Found");
  }

  console.log(productdata);
  const comment_data = await Review.create({
    product_id: id,
    rating: rating,
    review_comment: comment,
    createdBy: req.user._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { comment_data }, "reviews fetched"));
});

const getComment = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const productdata = await Product.findOne({ _id: new ObjectId(id) });
  if (!productdata) {
    throw new ApiError(404, "No Product Found");
  }

  console.log(productdata);
  const reviewdata = await Review.find({
    product_id: new ObjectId(id),
  }).populate({ path: "createdBy", select: "fullName avatar" });
  return res
    .status(200)
    .json(new ApiResponse(200, { reviewdata }, "reviews comment fetched"));
});

const editComment = asyncHandler(async (req, res) => {
  const reviewId = req.params.reviewId;
  const comment = req.body.comment;
  await Review.findByIdAndUpdate(new ObjectId(reviewId), {
    review_comment: comment,
  });
  const reviewdata = await Review.findById(new ObjectId(reviewId));
  return res
    .status(200)
    .json(new ApiResponse(200, { reviewdata }, "reviews succesfull updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const reviewId = req.params.reviewId;
  const reviewdata = await Review.findById(new ObjectId(reviewId));
  if (!reviewdata) {
    throw new ApiError(404, "review Not Found");
  }

  await Review.findByIdAndDelete(new ObjectId(reviewId));
  return res
    .status(200)
    .json(new ApiResponse(200, "reviews succesfull deleted"));
});

export {
  createProduct,
  getShopProfile,
  updateProduct,
  oneProduct,
  deleteProduct,
  updateShopProfile,
  createComment,
  allProducts,
  getComment,
  editComment,
  deleteComment,
};
