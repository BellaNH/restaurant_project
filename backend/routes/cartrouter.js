import express from "express"
import authUser from "../middleware/authuser.js"
import { addtocart,removefromcart , getCart } from "../controllers/cartcontroller.js"
import { validate } from "../middleware/validation.js"
import { cartItemSchema } from "../middleware/validationSchemas.js"

const cartRouter = express.Router()

cartRouter.post("/add",authUser,validate(cartItemSchema),addtocart)
cartRouter.post("/remove",authUser,validate(cartItemSchema),removefromcart)
cartRouter.post("/get",authUser,getCart)

export default cartRouter