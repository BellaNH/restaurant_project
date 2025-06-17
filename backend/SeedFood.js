import mongoose from "mongoose"
import foodmodel from "./models/foodmodel.js"
import {food_list} from './FoodItemData/FoodData.js';


async function SeedFood() {
    try{
        await mongoose.connect('mongodb://localhost:27017/testDB').then(()=>console.log("db connected"));
        await foodmodel.insertMany(food_list)
        console.log("food added")
    }catch(error){
        console.log(error)
    }
    
}
SeedFood()
