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

app.use(cors({
  origin: [
    "http://localhost:5173",        
    "https://restaurantw.netlify.app"   
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json())
app.use(cookieParser())

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
