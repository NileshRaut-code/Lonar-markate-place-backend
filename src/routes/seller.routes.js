import { Router } from "express";
import {
  getComment,
  getShopProfile,
} from "../controllers/seller.controller.js";
import { verifySeller } from "../middlewares/seller.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  updateProduct,
  oneProduct,
  deleteProduct,
  updateShopProfile,
  createComment,
  allProducts,
  editComment,
  deleteComment,
} from "../controllers/seller.controller.js";
import { verifyCreator } from "../middlewares/creator.middleware.js";
import { verifyOwner } from "../middlewares/owner.middleware.js";
import { verifyreviewCreator } from "../middlewares/reviewcreator.middleware.js";
const router = Router();

router.route("/allproduct").get(allProducts);
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
router.route("/product/createcomment/:id").post(verifyJWT, createComment);
router
  .route("/product/editcomment/:reviewId")
  .put(verifyJWT, verifyreviewCreator, editComment);
router
  .route("/product/deletecomment/:reviewId")
  .delete(verifyJWT, verifyreviewCreator, deleteComment);

router.route("/product/comment/:id").get(verifyJWT, getComment);
export default router;
