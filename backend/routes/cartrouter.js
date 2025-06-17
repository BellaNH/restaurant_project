import express from "express"
import authUser from "../middleware/authuser.js"
import { addtocart,removefromcart , getCart } from "../controllers/cartcontroller.js"

const cartRouter = express.Router()

cartRouter.post("/add",authUser,addtocart)
cartRouter.post("/remove",authUser,removefromcart)
cartRouter.post("/get",authUser,getCart)

export default cartRouter