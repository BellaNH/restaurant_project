import express from "express"
import {fetchRole} from "../controllers/usercontroller.js"
import authUser from "../middleware/authuser.js"

const userRouter  = express.Router();

/*userRouter.post("/register",register)
userRouter.post("/login",login)*/
userRouter.post("/role",authUser,fetchRole)

export default userRouter