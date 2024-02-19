import { Schema, mongoose } from "mongoose";

const orderScehma = new Schema(
  {
    product_list: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price: Number,
        title: String,
      },
    ],
    total_cost: {
      type: Number,
      default: 0,
    },
    ordercreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    payment_mode: {
      type: String,
      enum: ["COD", "CREDITCARD", "EMI"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "ORDERED BUT PENDING TO DISPATCH",
        "CANCLED",
        "DISPATCH",
        "DELIVERED",
      ],
      default: "ORDERED BUT PENDING TO DISPATCH",
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderScehma);
