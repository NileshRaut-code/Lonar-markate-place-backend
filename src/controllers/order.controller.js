import { Order } from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { ObjectId } from "mongodb";
import { ApiError } from "../utils/ApiError.js";

const allOrder = asyncHandler(async (req, res) => {
  const allorderData = await Order.find({}).populate("product_id");

  res.json(new ApiResponse(200, allorderData, "All data Fecthed"));
});


const verifyOrderPayment = asyncHandler(async (req, res) => {
  // Convert orderId to ObjectId if it's not already
  const orderId = new ObjectId(req.body.orderId);

  // Generate a payment ID
  const payment_id = `PAY_${Date.now()}_${req.body.orderId}`;

  // Use findOneAndUpdate to find the order and update it in one operation
  const order = await Order.findOneAndUpdate(
    { _id: orderId }, // Query condition
    { 
      payment_status: "SUCCESS", 
      payment_id: payment_id 
    }, // Update fields
    { new: true } // Return the updated document
  );

  // If no order found, return an error
  if (!order) {
    throw new ApiError(404, "Order Not found");
  }

  // Send success response with the updated order
  res.json(new ApiResponse(200, order, "The Payment Success"));
});

const createOrder = asyncHandler(async (req, res) => {
  const { products, address, pincode, payment_mode } = req.body;
  const ordercreatedBy = req.user._id;
  const createdOrders = [];

  for (const product of products) {
    const { product_id, quantity, price } = product;
    console.log(product_id);
    // Create the order for each product
    const createdOrder = await Order.create({
      product_id,
      address,
      pincode,
      payment_mode,
      quantity,
      price,
      ordercreatedBy,
      payment_status: payment_mode === "COD" ? "COD" : "PENDING",

    });

    // Push the created order to the array of createdOrders
    createdOrders.push(createdOrder);
  }
  res.json(new ApiResponse(200, createdOrders, "succesfully created"));
});

const viewOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const currentuserid = req.user._id;
  console.log(currentuserid);
  const orderdata = await Order.find({
    _id: new ObjectId(orderId),
    ordercreatedBy: new ObjectId(currentuserid),
  })
    .populate({
      path: "product_id", // Populate the product field inside the product_list array
      select: "image title",
    })
    .select();
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
  })
    .populate({
      path: "product_id", // Populate the product field inside the product_list array
      select: "image title",
    })
    .select();
  console.log(orderdata);
  if (orderdata.length == 0) {
    throw new ApiError(404, "Order Not found");
  }
  res.json(
    new ApiResponse(200, orderdata, "succesfully fetched All Logged Uesr order")
  );
});

export { allOrder, createOrder, viewOrder, viewallOrder,verifyOrderPayment };
