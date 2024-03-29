import { Schema, mongoose } from "mongoose";

const orderScehma = new Schema({
  product_list: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  total_cost: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Order = mongoose.model("Order", orderScehma);
