import mongoose from "mongoose";


const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Category name is required"],
        unique:true,
        trim:true,
        minlength:[2, "Category name must be at least 2 characters"],
        maxlength:[50, "Category name cannot exceed 50 characters"]
    },
    image:{
        type:String,
        required:[true, "Category image is required"]
    }
},{
    timestamps:true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
categorySchema.index({ name: 1 }); // Index on name (already unique, but explicit index helps)

const categoryModel = mongoose.models.category || mongoose.model("category",categorySchema)
export default categoryModel;
