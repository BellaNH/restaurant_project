import foodmodel from "../models/foodmodel.js";
import fs from "fs"
const addFood = async (req,res)=>{
    try{
        // Input is already validated and sanitized by middleware
        let image_filename = `${req.file.filename}`;
        const food = new foodmodel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename,
    })
        await food.save();
        return res.json({success:true,message:"food added successfuly"})
    } catch(error){
        return res.json({success:false,message:"Error"})
    }
}
const listFood = async (req,res)=>{
    try{
        const page = parseInt(req.query.page,10) || 1;
        const limit = parseInt(req.query.limit,10) || 12;
        const skip = (page - 1) * limit;

        const [items,total] = await Promise.all([
            foodmodel
                .find({})
                .select("name description price image category createdAt")
                .sort({createdAt:-1})
                .skip(skip)
                .limit(limit),
            foodmodel.countDocuments()
        ]);

        return res.json({
            success:true,
            data:items,
            pagination:{
                page,
                limit,
                total,
                pages: Math.ceil(total/limit)
            }
        })
    }catch(error){
        return res.json({success:false,message:"error"})     
    }
}
const fetchEditedFood = async (req,res)=>{
    try{
        const editedFood = await foodmodel.findById(req.query.id)
        return res.json({success:true,data:editedFood})
    }catch(error){
        return res.json({success:false,message:"error"})     
    }
}

const removeFood = async (req,res)=>{
    try{
        const removedfood = await foodmodel.findById(req.body.id);
        fs.unlink(`uploads/${removedfood.image}`,()=>{})
        await foodmodel.findByIdAndDelete(req.body.id)
        return res.json({success:true,message:"item removed seccessfuly"})
    }catch(error){res.json({success:false,message:"error"})}
}
const editFood = async (req,res)=>{
    
    let image_filename;

    if (req.file) {
      image_filename = req.file.filename; 
    } else {
      image_filename = req.body.imageFilename;
    }

    try{
        const modifiedFood = await foodmodel.findByIdAndUpdate(req.body.id,{
            name:req.body.name,
            description:req.body.description,
            price:req.body.price,
            category:req.body.category,
            image:image_filename,
        },{ new: true }
    )  
        return res.json({success:true,message:"Food item edited successfuly",food:modifiedFood})

    }
    catch(error){
       console.error(error); // Log full error to console
  return res.json({
    success: false,
    message: "Edit operation failed",
    error: error.message || error.toString(),
  });
    }
}
export {addFood,listFood,fetchEditedFood,removeFood,editFood}