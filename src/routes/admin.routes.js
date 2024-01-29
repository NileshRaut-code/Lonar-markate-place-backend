import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  allSellerData,
  allUserData,
  changeRole,
  oneUserData,
  oneSellerData,
} from "../controllers/admin.controller.js";
const router = Router();

router.route("/").post(verifyJWT, verifyAdmin);
//admin ke acces routes , hhoge sirf...

router.route("/Dashboard/sellers").get(verifyJWT, verifyAdmin, allSellerData);
router.route("/Dashboard/users").get(verifyJWT, verifyAdmin, allUserData);
router
  .route("/Dashboard/sellers/:id")
  .get(verifyJWT, verifyAdmin, oneSellerData);
router.route("/Dashboard/users/:id").get(verifyJWT, verifyAdmin, oneUserData);

router.route("/changerole").post(verifyJWT, verifyAdmin, changeRole);
export default router;
