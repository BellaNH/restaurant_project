import mongoose from "mongoose"

export const connectDB = async ()=>{
   mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>console.log("db connected"))
}
