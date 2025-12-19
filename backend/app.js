import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import foodRouter from "./routes/foodrouter.js";
import userRouter from "./routes/userrouter.js";
import cartRouter from "./routes/cartrouter.js";
import orderRouter from "./routes/orderRouter.js";
import categoryRouter from "./routes/categoryrouter.js";
import authRouter from "./routes/authRouter.js";
import { handleDBError } from "./middleware/dbErrorHandler.js";

const app = express();

// Parse allowed origins from environment variable (comma-separated)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "https://restaurantw.netlify.app"];

// Basic rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/images", express.static("uploads"));
app.use("/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

// Database error handler middleware (must be before other error handlers)
app.use(handleDBError);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;

