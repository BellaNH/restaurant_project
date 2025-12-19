import mongoose from "mongoose";


const foodSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Food name is required"],
        trim:true,
        minlength:[2, "Food name must be at least 2 characters"],
        maxlength:[100, "Food name cannot exceed 100 characters"]
    },
    description:{
        type:String,
        required:[true, "Description is required"],
        trim:true,
        minlength:[10, "Description must be at least 10 characters"],
        maxlength:[500, "Description cannot exceed 500 characters"]
    },
    price:{
        type:Number,
        required:[true, "Price is required"],
        min:[0.01, "Price must be greater than 0"],
        max:[10000, "Price cannot exceed 10000"]
    },
    image:{
        type:String,
        required:[true, "Image is required"]
    },
    category:{
        type:String,
        required:[true, "Category is required"],
        trim:true,
        minlength:[2, "Category must be at least 2 characters"],
        maxlength:[50, "Category cannot exceed 50 characters"]
    }
},{
    timestamps:true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
foodSchema.index({ category: 1 }); // Index on category for filtering
foodSchema.index({ name: 1 }); // Index on name for searching
foodSchema.index({ price: 1 }); // Index on price for sorting

const foodmodel = mongoose.models.food || mongoose.model("food",foodSchema)
export default foodmodel;