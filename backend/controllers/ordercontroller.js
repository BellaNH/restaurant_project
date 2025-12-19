import ordermodel from "../models/ordermodel.js"
import Stripe from "stripe"
import userModel from "../models/usermodel.js" 
import { DELIVERY_FEE, STRIPE_CURRENCY } from "../config/constants.js"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const placeorder = async (req,res)=>{
    const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173/"
    try{
    const newOrder = new ordermodel({
        userId:req.body.userId,
        address:req.body.ordersdata.address || req.body.ordersdata.adress,
        items:req.body.ordersdata.items,
        amount:req.body.ordersdata.amount,
    })
    await newOrder.save()
    await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}})
    const line_items = newOrder.items.map((item)=>({
        price_data:{
            currency:STRIPE_CURRENCY,
            product_data:{
                name:item.name
            },
            unit_amount:item.price*100
        },
        quantity:item.quantity
    })) 
    line_items.push({
        price_data:{
            currency:STRIPE_CURRENCY,
            product_data:{
                name:"Delivery charges"
            },
            unit_amount:DELIVERY_FEE*100
        },
        quantity:1
    })
    const session = await stripe.checkout.sessions.create({
        line_items:line_items,
        mode:"payment",
        success_url:`${frontend_url}verifyorder?success=true&orderId=${newOrder._id}`,
        cancel_url: `${frontend_url}verifyorder?success=false`
    })
    res.json({success:true,message:"payment done successfuly",success_url:session.url})
}catch(error){
    return res.json({success:false,message:error.message})
}
}
const verifyOrder =  async (req,res)=>{
    const {success,orderId}=req.body
    if(success===true){
        await ordermodel.findByIdAndUpdate(orderId,{status:true})
        res.json({success:true,message:"order successfuly payed"})
    }else{
        await ordermodel.findByIdAndDelete(req.body.orderId)
        res.json({success:false,message:"concelled order"})
    }
}
const myOrders = async (req,res)=>{
    try{
        const orders = await ordermodel.find({userId:req.body.userId})
        res.json({success:true,data:orders})
    }catch(error){
        res.json({success:false,message:"error"})
    }  
}
const allOrders = async (req,res)=>{
    try{
        const orders = await ordermodel.find({})
        res.json({success:true,data:orders,message:"orders fetched successfully"})
    }catch(error){
        res.json({success:false,message:"error"})
    }
}

const updateStatus = async (req,res)=>{
    try{
        await ordermodel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
        res.json({success:true,message:"status updated successfuly"})
    }catch(error){
        res.json({success:false,message:"error"})
    }
} 
export {placeorder,verifyOrder,myOrders,allOrders,updateStatus}