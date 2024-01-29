import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyAdmin = asyncHandler(async (req, _, next) => {
  try {
    const user = req.user;
    console.log(user);
    if (!user || user.role !== "ADMIN") {
      throw new ApiError(403, "Forbidden: Admin access required");
    }

    next();
  } catch (error) {
    throw new ApiError(403, error?.message || "Forbidden");
  }
});
