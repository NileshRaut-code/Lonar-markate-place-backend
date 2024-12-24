import { Router } from "express";
import {
  EditOrder,
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
  allOrder,
} from "../controllers/seller.controller.js";
import { verifyCreator } from "../middlewares/creator.middleware.js";
import { verifyOwner } from "../middlewares/owner.middleware.js";
import { verifyreviewCreator } from "../middlewares/reviewcreator.middleware.js";
import multer from "multer";
const router = Router();
const upload = multer();

router.route("/allproduct").get(allProducts);
router.route("/shop/:username").get(getShopProfile);

router.route("/product/:id").get(oneProduct);
router
  .route("/product/delete/:id")
  .delete(verifyJWT, verifySeller, deleteProduct);
router
  .route("/edit/product/:productId")
  .put(verifyJWT, verifyCreator, upload.any("image", 1), updateProduct);
//verifySeller,
router
  .route("/create-product")
  .post(verifyJWT, verifySeller, upload.any("image", 1), createProduct);

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

router.route("/product/comment/:id").get(getComment);

router.route("/order/confirm").put(verifyJWT, verifySeller, EditOrder);
router.route("/allorder").get(verifyJWT, verifySeller, allOrder);

export default router;
