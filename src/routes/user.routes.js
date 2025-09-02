import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateAccountDetails,
  allProducts,
  allProductsLimitpage,
  forgotPassword,
  resetPassword,
  GoogleSignup,GoogleloginUser,
  Loadallads
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

const upload = multer();
const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

//secured route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/forgot/password").patch(forgotPassword);
router.route("/reset/password").patch(resetPassword);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.any("image", 1), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/allproduct").get(allProducts);
router.route("/allproduct/page/:id").get(allProductsLimitpage);
router.route("/google-login").post(GoogleloginUser);
router.route("/google-signup").post(GoogleSignup);
router.route("/Load_Ads").get(Loadallads)

export default router;

// upload.fields([
//     {
//         name: "avatar",
//         maxCount: 1
//     },
//     {
//         name: "coverImage",
//         maxCount: 1
//     }
// ]),
