import "dotenv/config"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodrouter.js"
import userRouter from "./routes/userrouter.js"
import cartRouter from "./routes/cartrouter.js"
import orderRouter from "./routes/orderouter.js"
import categoryRouter from "./routes/categoryrouter.js"
import authRouter from "./routes/authRouter.js"

const app = express()
const port = process.env.PORT || 4000

// ✅ 1. CORS FIRST and correctly configured
const corsOptions = {
  origin: process.env.FRONTEND_URL, // e.g. "https://restaurantw.netlify.app"
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ 2. Then body parsing and cookies
app.use(express.json())
app.use(cookieParser())

// ✅ 3. DB and routes
connectDB()

app.use("/api/auth", authRouter)
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/category", categoryRouter)
app.use("/images", express.static("uploads"))
app.use("/cart", cartRouter)
app.use("/api/order", orderRouter)

app.get("/", (req, res) => {
  res.send("API Working")
})

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
})
