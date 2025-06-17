import { Router } from "express";
import {
    allOrder,
    createOrder,
    createRazorpayOrder,
    verifyOnlinePayment,
    viewallOrder,
    viewOrder
} from "../controllers/order.controller.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/admin").get(verifyJWT, verifyAdmin, allOrder);



// For Cash on Delivery (COD) orders
router.route("/create-order").post(verifyJWT, createOrder);

// For Online Payments: Step 1 - Get Razorpay Order ID
router.route("/create-razorpay-order").post(verifyJWT, createRazorpayOrder);

// For Online Payments: Step 2 - Verify Payment & Create Order in DB
router.route("/verify-payment").post(verifyJWT, verifyOnlinePayment);

router.route("/view-orders").get(verifyJWT, viewallOrder);

router.route("/view-order/:orderId").get(verifyJWT, viewOrder);

export default router;
