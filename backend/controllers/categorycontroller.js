import categoryModel from "../models/categorymodel.js"
import isAuthenticated from "../middleware/authuser.js"
import fs from "fs"
const fetchCategories = async (req,res)=>{
    try{
        const fetchedcat = await categoryModel.find({})
        return res.json({success:true,data:fetchedcat})
        console.log(fetchedcat)
        return res.json({success:true,data:fetchedcat,message:"categpries fetched successfuly"})
    }
    catch(error){
        return res.json({success:false,message:error})
    }
}
const addCategory = async (req,res)=>{
    let image_filename = `${req.file.filename}`
    try{
        const newCategory = new categoryModel({
            name:req.body.name,
            image:image_filename
        })
        await newCategory.save()
        return res.json({success:true,data:newCategory})
        console.log(newCategory)
    }
    catch(error){
        return res.json({success:false,message:error})
    }

}
const fetchEditedCategory = async (req,res) =>{
    try{
        const editedCateg = await categoryModel.findById(req.query.id)
        return res.json({success:true,data:editedCateg})
    }
    catch(error){
        return res.json({success:false,message:error})
    }
}
const editCategory = async (req,res) =>{
    let image_file 
    try{  
        if(req.file){
            image_file = req.file.filename
        }else{
            image_file = req.body.imageFilename
        }
        const editedCateg = await categoryModel.findByIdAndUpdate(req.body.id,{
            name:req.body.name,
            image:image_file
        },{ new: true }) 
        return res.json({success:true,data:editedCateg})

    }catch(error){
        return res.json({success:false,message:error})
    }
}
const removeCategory = async (req,res) =>{
    try{
        const removedCateg = await categoryModel.findById(req.body.id)
        fs.unlink(`uploads/${removedCateg.image}`,()=>{})
        await categoryModel.findByIdAndDelete(req.body.id)
        return res.json({success:true,message:"Category removed seccessfuly"})
    }
    catch(error){
        return res.json({success:false,message:error})
    }
}

export {fetchCategories,addCategory,fetchEditedCategory,editCategory,removeCategory}