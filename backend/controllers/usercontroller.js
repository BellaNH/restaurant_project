import userModel from "../models/usermodel.js";
import validator from "validator";
import jwt from "jsonwebtoken"

const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}
const fetchRole = async (req,res)=>{ 
    try{
        const user = await userModel.findById(req.body.userId)
        return res.json({success:true,isAdmin:user.isAdmin})      
    }
    catch(error){
        return res.json({success:false,message:error})
    }
}


export {fetchRole}