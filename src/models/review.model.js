import mongoose, { Mongoose, Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    product_id: {
      type: String,
      require: true,
    },
    review_comment: {
      type: String,
      require: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model("Review", reviewSchema);
