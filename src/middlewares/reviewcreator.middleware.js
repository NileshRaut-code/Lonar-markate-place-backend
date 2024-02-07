import { asyncHandler } from "../utils/asyncHandler.js";
import { Review } from "../models/review.model.js";
import { ObjectId } from "mongodb";
import { ApiError } from "../utils/ApiError.js";
export const verifyreviewCreator = asyncHandler(async (req, _, next) => {
  const review_id = req.params.reviewId;
  const review = await Review.findOne({
    _id: new ObjectId(review_id),
  }).select("createdBy");
  if (!review) {
    throw new ApiError(404, "Review Does not Exist");
  }
  if (String(review.createdBy) === String(req.user._id)) {
    // console.log("this icalling", req.user._id);
    return next();
  }
  throw new ApiError(404, "Not Authorized To Edit");
});
