import express from "express";
import authUser from "../middleware/authuser.js"
import ordermodel from "../models/ordermodel.js"
import { placeorder,verifyOrder,myOrders,allOrders,updateStatus } from "../controllers/ordercontroller.js";
 
const orderRouter = express.Router()
orderRouter.post("/placeorder",authUser,placeorder)
orderRouter.post("/verifyorder",authUser,verifyOrder)
orderRouter.post("/myorders",authUser,myOrders)
orderRouter.post("/allorders",authUser,allOrders)
orderRouter.post("/status",authUser,updateStatus)
export default orderRouter