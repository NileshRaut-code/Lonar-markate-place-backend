import { Schema, mongoose } from "mongoose";

const orderSchema = new Schema(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", require: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total_cost: { type: Number },
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
      enum: ["COD", "ONLINE"],
      required: true,
    },
    payment_status:{
      type: String,
      enum: ["PENDING", "SUCCESS", "COD"],
      required: true,
    },
    payment_id:{
      type: String,

    },
    razorpay_order_id:{
      type: String,
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
orderSchema.pre("save", function (next) {
  // Calculate the total cost based on price and quantity
  this.total_cost = this.price * this.quantity;
  next();
});
export const Order = mongoose.model("Order", orderSchema);
