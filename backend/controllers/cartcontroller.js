import userModel from "../models/usermodel.js"

const addtocart = async (req,res)=>{
    try{
        let user = await userModel.findById(req.body.userId)
        let cartData =  user.cartData 
        if(!cartData[req.body.itemId]){
            cartData[req.body.itemId]=1
        }else{
            cartData[req.body.itemId]+=1
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData})
        res.json({success:true,message:"item added successsfully"})
    }catch(error){
        res.json({success:false,message:"error"})
}
}
const removefromcart = async (req,res)=>{
    try{
    let user = await userModel.findById(req.body.userId)
    let cartData =  user.cartData 
    if(cartData[req.body.itemId]>0){
        cartData[req.body.itemId]-=1
    }
    await userModel.findByIdAndUpdate(req.body.userId,{cartData})
    res.json({success:true,message:"item removed successsfully"})
}
    catch(error){
        res.json({success:false,message:"error"})
    }
    
}
const getCart = async (req,res)=>{
    try{
        let user = await userModel.findById(req.body.userId)
        let cartData = user.cartData 
        res.json({success:true,data:cartData})
    }catch(error){
        res.json({success:false,message:"error"})
    }
}
export {addtocart,removefromcart,getCart}


