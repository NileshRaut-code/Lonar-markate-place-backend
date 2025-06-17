import { Order } from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { ObjectId } from "mongodb";
import { ApiError } from "../utils/ApiError.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // YOUR KEY ID
    key_secret: process.env.RAZORPAY_KEY_SECRET, // YOUR KEY SECRET
});

const allOrder = asyncHandler(async (req, res) => {
  const allorderData = await Order.find({}).populate("product_id");

  res.json(new ApiResponse(200, allorderData, "All data Fecthed"));
});


const verifyOrderPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Database operations
        await Order.findOneAndUpdate(
            { razorpay_order_id: razorpay_order_id },
            {
                payment_id: razorpay_payment_id,
                payment_status: "SUCCESS",
            },
            { new: true }
        );

        res.json(new ApiResponse(200, { verified: true }, "Payment verified successfully"));
    } else {
        throw new ApiError(400, "Invalid payment signature");
    }
});

const createOrder = asyncHandler(async (req, res) => {
    const { products, address, pincode, payment_mode } = req.body;
    const ordercreatedBy = req.user._id;
    const createdOrders = [];

    let totalAmount = 0;
    for (const product of products) {
        totalAmount += product.price * product.quantity;
    }

    if (payment_mode !== "COD") {
        const options = {
            amount: totalAmount * 100, // amount in the smallest currency unit
            currency: "INR",
        };
        const razorpayOrder = await razorpay.orders.create(options);

        for (const product of products) {
            const { product_id, quantity, price } = product;
            const createdOrder = await Order.create({
                product_id,
                address,
                pincode,
                payment_mode,
                quantity,
                price,
                ordercreatedBy,
                payment_status: "PENDING",
                razorpay_order_id: razorpayOrder.id,
            });
            createdOrders.push(createdOrder);
        }
        res.json(new ApiResponse(200, { createdOrders, razorpayOrder }, "Order created successfully"));
    } else {
        for (const product of products) {
            const { product_id, quantity, price } = product;
            const createdOrder = await Order.create({
                product_id,
                address,
                pincode,
                payment_mode,
                quantity,
                price,
                ordercreatedBy,
                payment_status: "COD",
            });
            createdOrders.push(createdOrder);
        }
        res.json(new ApiResponse(200, createdOrders, "Order created successfully (COD)"));
    }
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
