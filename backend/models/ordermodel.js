import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:[true, "User ID is required"],
        ref: 'user' // Reference to user model
    },
    address:{
        type:Object,
        required:[true, "Address is required"],
        alias: "adress", // legacy compatibility
        validate: {
            validator: function(v) {
                return v && typeof v === 'object' && Object.keys(v).length > 0;
            },
            message: "Address must be a valid object"
        }
    },
    items:{
        type:Array,
        required:[true, "Order items are required"],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: "Order must contain at least one item"
        }
    },
    amount:{
        type:Number,
        required:[true, "Order amount is required"],
        min:[0.01, "Amount must be greater than 0"]
    },
    status:{
        type:String,
        default:"Order Processing",
        enum: {
            values: ["Order Processing", "Out for delivery", "Delivered", "Cancelled"],
            message: "Status must be one of: Order Processing, Out for delivery, Delivered, Cancelled"
        }
    },
    payement:{
        type:Boolean,
        required:true,
        default:false
    },   
    date:{
        type:Date,
        default:Date.now
    }
},{
    timestamps:true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
orderSchema.index({ userId: 1 }); // Index on userId for user order queries
orderSchema.index({ status: 1 }); // Index on status for filtering orders
orderSchema.index({ date: -1 }); // Index on date for sorting (descending)
orderSchema.index({ userId: 1, date: -1 }); // Compound index for user orders sorted by date

const ordermodel = mongoose.models.ordermodel || mongoose.model("order",orderSchema)
export default ordermodel;