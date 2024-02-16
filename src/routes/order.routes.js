import { Router } from "express";
import { allOrder, createOrder } from "../controllers/order.controller.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { viewOrder, viewallOrder } from "../controllers/order.controller.js";
const router = Router();

router.route("/admin").get(verifyJWT, verifyAdmin, allOrder);
router.route("/create-order").post(verifyJWT, createOrder);
router.route("/view-order/:orderId").get(verifyJWT, viewOrder);
router.route("/view-order").get(verifyJWT, viewallOrder);

export default router;
