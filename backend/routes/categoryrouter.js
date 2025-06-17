import express from "express"
import {fetchCategories,addCategory,fetchEditedCategory,editCategory,removeCategory} from "../controllers/categorycontroller.js"
import multer from "multer"
import authUser from "../middleware/authuser.js"

const categoryRouter = express.Router()
const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }   
})
const upload = multer({storage:storage})

categoryRouter.get("/list",fetchCategories)
categoryRouter.post("/addCategory",authUser,upload.single("image"),addCategory)
categoryRouter.get('/fetchEditedCateg',authUser,fetchEditedCategory)
categoryRouter.post('/editCategory',authUser,upload.single("image"),editCategory)
categoryRouter.post('/removeCategory',authUser,removeCategory)


export default categoryRouter