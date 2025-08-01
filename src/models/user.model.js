import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      // default role
      enum: ["USER", "ADMIN", "SELLER", "BANNED"],
      default: "USER",
    },
    phoneno: {
      type: Number,
      required: [true, "Phone No is required is required"],
    },
    avatar: {
      type: String, // cloudinary url
      default:
        "https://res.cloudinary.com/dowwcdnts/image/upload/v1706078608/x3neqhcnnaazgg8ay46p.png",
      // required: true,
    },
    coverImage: {
      type: String, // cloudinary url
      default:
        "https://res.cloudinary.com/dowwcdnts/image/upload/v1706079184/yiobla8dr5dqfmvfduk0.jpg",
    },
    //products: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    resetToken: String,
    resetTokenExpiry: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
