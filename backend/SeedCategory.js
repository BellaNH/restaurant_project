import "dotenv/config"
import mongoose from 'mongoose'
import food_category from "./FoodItemData/FoodData.js"
import categoryModel from "./models/categorymodel.js"

async function SeedCategory() {
  try{
    await mongoose.connect(process.env.MONGO_URL).then(()=>console.log("db connected"));
    await categoryModel.insertMany(food_category)
    console.log("category added ")
  }
  catch(error){
    console.log(error)
  }
}
SeedCategory()
export default SeedCategory