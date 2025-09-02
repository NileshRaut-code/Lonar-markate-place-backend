import { Schema, mongoose } from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    productdescription: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
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
  },
  {
    timestamps: true,
  }
);


productSchema.plugin(function paginatePlugin(schema) {
  schema.statics.paginate = async function (query = {}, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.find(query).skip(skip).limit(limit),
      this.countDocuments(query),
    ]);
    return { data, pagination:{total, page, pages: Math.ceil(total / limit)} };
  };
});


export const Product = mongoose.model("Product", productSchema);
