import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { ObjectId } from "mongodb";
import { ApiError } from "../utils/ApiError.js";
export const verifyCreator = asyncHandler(async (req, _, next) => {
  const product_id = req.params.productId;
  const product = await Product.findOne({
    _id: new ObjectId(product_id),
  }).select("createdBy");
  if (!product) {
    throw new ApiError(404, "Product Does not Exist");
  }
  if (String(product.createdBy) === String(req.user._id)) {
    // console.log("this icalling", req.user._id);
    return next();
  }
  throw new ApiError(404, "Not Authorized To Edit");
});
