import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    adress:{type:Object,required:true},
    items:{type:Array,required:true},
    amount:{type:Number,required:true},
    status:{type:String,default:"Order Processing"},
    payement:{type:Boolean,required:true,default:false},   
    date:{type:Date,default:Date.now()}

})
const ordermodel = mongoose.models.ordermodel || mongoose.model("order",orderSchema)
export default ordermodel;