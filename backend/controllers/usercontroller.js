import userModel from "../models/usermodel.js";
import validator from "validator";
import bycrypt from "bcrypt"
import jwt from "jsonwebtoken"

const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}
/*const register = async (req,res)=>{
    const {name,email,password} = req.body
    try{
        const userExists = await userModel.findOne({email})
    if(userExists){
        return res.json({success:false,message:"User already exists"})
    }
    if(!validator.isEmail(email)){
        return res.json({success:false,message:"Please enter a valid email"})
    }
    if(password.length<8){
        return res.json({success:false,message:"Please enter a stronger password"})
    }
    const salt = await bycrypt.genSalt(10)
    const hashedPassword = await bycrypt.hash(password,salt)
    const newUser = new userModel({
        name:name,
        email:email,
        password:hashedPassword
    })
    const user = await newUser.save()
    return res.json({success:true,message:"User created successfuly!"})
    const token = createToken(user._id)
    }catch(error){
        return res.json({success:false,message:"Error"})
    }
    
}

const login = async (req,res)=>{
    const {email,password} = req.body
    try{
        const userExists = await userModel.findOne({email})
        if(!userExists){
            res.json({success:false,message:"This email adress doesnt exist"})
        }
        const passwordAccurency = await bycrypt.compare(password,userExists.password)
        if(!passwordAccurency){
            res.json({success:false,message:"Please enter a correct password"})
        }
        const token = createToken(userExists._id)
        res.json({success:true,token})
    }catch(error){
        res.json({success:false,message:"Error"})
    }
}*/
const fetchRole = async (req,res)=>{ 
    console.log(req.body.id) 
    try{
        const user = await userModel.findById(req.body.userId)
        console.log(user)
        return res.json({success:true,isAdmin:user.isAdmin})      
    }
    catch(error){
        return res.json({success:false,message:error})
    }
}


export {fetchRole}