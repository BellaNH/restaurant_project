import express from "express";
import authUser from "../middleware/authuser.js"
import authAdmin from "../middleware/authAdmin.js"
import { placeorder,verifyOrder,myOrders,allOrders,updateStatus } from "../controllers/ordercontroller.js";
import { validate } from "../middleware/validation.js"
import { placeOrderSchema, updateOrderStatusSchema } from "../middleware/validationSchemas.js"
 
const orderRouter = express.Router()
// User routes - require authentication
orderRouter.post("/placeorder",authUser,validate(placeOrderSchema),placeorder)
orderRouter.post("/verifyorder",authUser,verifyOrder)
orderRouter.post("/myorders",authUser,myOrders)
// Admin routes - require admin authentication
orderRouter.post("/allorders",authAdmin,allOrders)
orderRouter.post("/status",authAdmin,validate(updateOrderStatusSchema),updateStatus)
export default orderRouter







