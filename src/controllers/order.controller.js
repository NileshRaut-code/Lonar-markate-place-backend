import { Order } from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { ObjectId } from "mongodb";
import { ApiError } from "../utils/ApiError.js";

const allOrder = asyncHandler(async (req, res) => {
  const allorderData = await Order.find({}).populate("product_list");

  res.json(new ApiResponse(200, allorderData, "All data Fecthed"));
});

const createOrder = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  console.log(productId);
  const currentuserid = req.user._id;
  const productdata = await Product.findOne({
    _id: new ObjectId(productId),
  });
  const pId = productdata._id;
  const sellerId = productdata.createdBy;
  console.log(sellerId);
  const createddata = await Order.create({
    product_list: pId,
    ordercreatedBy: currentuserid,
    seller: sellerId,
  });
  res.json(new ApiResponse(200, createddata, "succesfully created"));
});

const viewOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const currentuserid = req.user._id;
  console.log(currentuserid);
  const orderdata = await Order.find({
    _id: new ObjectId(orderId),
    ordercreatedBy: new ObjectId(currentuserid),
  }).select();
  console.log(orderdata);
  if (orderdata.length == 0) {
    throw new ApiError(404, "Order Not found");
  }
  res.json(new ApiResponse(200, orderdata, "succesfully fetched One order"));
});
const viewallOrder = asyncHandler(async (req, res) => {
  const currentuserid = req.user._id;
  console.log(currentuserid);
  const orderdata = await Order.find({
    ordercreatedBy: new ObjectId(currentuserid),
  }).select();
  console.log(orderdata);
  if (orderdata.length == 0) {
    throw new ApiError(404, "Order Not found");
  }
  res.json(
    new ApiResponse(200, orderdata, "succesfully fetched All Logged Uesr order")
  );
});
export { allOrder, createOrder, viewOrder, viewallOrder };
