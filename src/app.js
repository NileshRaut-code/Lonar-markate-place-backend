import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import sellerRouter from "./routes/seller.routes.js";
import orderRouter from "./routes/order.routes.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/seller", sellerRouter);
app.use("/api/v1/orders", orderRouter);
// http://localhost:8000/api/v1/users/register

export { app };
