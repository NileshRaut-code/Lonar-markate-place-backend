import { Order } from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { ObjectId } from "mongodb";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// For Admin: Get all orders in the system
const allOrder = asyncHandler(async (req, res) => {
  const allorderData = await Order.find({}).populate("product_id");
  res.json(new ApiResponse(200, allorderData, "All order data fetched"));
});

// For User: Create a Cash on Delivery (COD) order
const createOrder = asyncHandler(async (req, res) => {
    const { products, address, pincode, payment_mode } = req.body;
    const ordercreatedBy = req.user._id;

    if (payment_mode !== "COD") {
        throw new ApiError(400, "This endpoint is only for Cash on Delivery orders.");
    }

    const createdOrders = [];
    for (const product of products) {
        const { product_id, quantity, price } = product;
        const createdOrder = await Order.create({
            product_id,
            address,
            pincode,
            payment_mode: "COD",
            quantity,
            price,
            ordercreatedBy,
            payment_status: "COD"
        });
        createdOrders.push(createdOrder);
    }
    res.json(new ApiResponse(200, createdOrders, "Order placed successfully (COD)"));
});

// For User: Step 1 of Online Payment - Create a Razorpay Order ID
const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { products } = req.body;
    let totalAmount = 0;
    for (const product of products) {
        totalAmount += product.price * product.quantity;
    }

    if (totalAmount === 0) {
        throw new ApiError(400, "Cannot create order with zero amount");
    }

    const options = {
        amount: totalAmount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_order_${new Date().getTime()}`
    };

    try {
        const razorpayOrder = await razorpay.orders.create(options);
        if (!razorpayOrder) {
            throw new ApiError(500, "Failed to create Razorpay order");
        }
        res.json(new ApiResponse(200, razorpayOrder, "Razorpay order created successfully"));
    } catch (error) {
        throw new ApiError(500, `Razorpay error: ${error.message}`);
    }
});

// For User: Step 2 of Online Payment - Verify signature and create order in DB
const verifyOnlinePayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        products,
        address,
        pincode
    } = req.body;
    const ordercreatedBy = req.user._id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        throw new ApiError(400, "Invalid payment signature. Payment failed.");
    }

    // Signature is valid, now create the order(s) in the database
    const createdOrders = [];
    for (const product of products) {
        const { product_id, quantity, price } = product;
        const createdOrder = await Order.create({
            product_id,
            address,
            pincode,
            payment_mode: "ONLINE",
            quantity,
            price,
            ordercreatedBy,
            payment_status: "SUCCESS",
            payment_id: razorpay_payment_id,
            razorpay_order_id: razorpay_order_id,
        });
        createdOrders.push(createdOrder);
    }

    res.json(new ApiResponse(200, { verified: true, orders: createdOrders }, "Payment verified and order created successfully"));
});

// For User: View all their own orders
const viewallOrder = asyncHandler(async (req, res) => {
  const currentuserid = req.user._id;
  const orderdata = await Order.find({ ordercreatedBy: new ObjectId(currentuserid) })
    .populate({ path: "product_id", select: "image title" });
    
  if (!orderdata || orderdata.length === 0) {
    return res.json(new ApiResponse(200, [], "No orders found for this user."));
  }
  res.json(new ApiResponse(200, orderdata, "Successfully fetched all orders for user"));
});

// For User: View a single specific order
const viewOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const currentuserid = req.user._id;
  const orderdata = await Order.findOne({ _id: new ObjectId(orderId), ordercreatedBy: new ObjectId(currentuserid) })
    .populate({ path: "product_id", select: "image title" });

  if (!orderdata) {
    throw new ApiError(404, "Order not found or you do not have permission to view it.");
  }
  res.json(new ApiResponse(200, orderdata, "Successfully fetched order details"));
});

export {
    allOrder,
    createOrder,
    createRazorpayOrder,
    verifyOnlinePayment,
    viewallOrder,
    viewOrder
};
