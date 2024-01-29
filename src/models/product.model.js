import { Schema, mongoose } from "mongoose";

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  productdescription: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  Avaiblestock: {
    type: Number,
    default: 0,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Product = mongoose.model("Product", productSchema);
