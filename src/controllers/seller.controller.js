import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ObjectId } from "mongodb";

const createProduct = asyncHandler(async (req, res) => {
  const createdBy = req.user._id;
  const { title, productdescription, price, availableStock } = req.body;
  if ([title, productdescription].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const newProduct = await Product.create({
    title,
    productdescription,
    price,
    availableStock,
    createdBy,
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
        from: "products", // The name of the collection you are looking up against
        localField: "_id",
        foreignField: "createdBy",
        as: "products",
      },
    },
    {
      $project: {
        password: 0, // exclude password field
        refreshToken: 0, // exclude refreshToken field
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

export {
  createProduct,
  getShopProfile,
  updateProduct,
  oneProduct,
  deleteProduct,
  updateShopProfile,
};
