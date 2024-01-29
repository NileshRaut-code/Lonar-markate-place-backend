import { Router } from "express";
import { getShopProfile } from "../controllers/seller.controller.js";
import { verifySeller } from "../middlewares/seller.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  updateProduct,
  oneProduct,
  deleteProduct,
  updateShopProfile,
} from "../controllers/seller.controller.js";
import { verifyCreator } from "../middlewares/creator.middleware.js";
import { verifyOwner } from "../middlewares/owner.middleware.js";
const router = Router();

router.route("/shop/:username").get(getShopProfile);

router.route("/product/:id").get(oneProduct);
router
  .route("/product/delete/:id")
  .delete(verifyJWT, verifySeller, deleteProduct);
router
  .route("/edit/product/:productId")
  .put(verifyJWT, verifyCreator, updateProduct);
//verifySeller,
router.route("/create-product").post(verifyJWT, verifySeller, createProduct);

router
  .route("/shop/edit/:username")
  .put(verifyJWT, verifySeller, verifyOwner, updateShopProfile);

export default router;
