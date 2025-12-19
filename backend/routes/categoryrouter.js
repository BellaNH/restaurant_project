import express from "express"
import {fetchCategories,addCategory,fetchEditedCategory,editCategory,removeCategory} from "../controllers/categorycontroller.js"
import multer from "multer"
import authAdmin from "../middleware/authAdmin.js"
import { validate } from "../middleware/validation.js"
import { categorySchema, editCategorySchema, removeCategorySchema } from "../middleware/validationSchemas.js"
import { validateImageUpload, requireFileUpload } from "../middleware/fileUploadValidation.js"

const categoryRouter = express.Router()
const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }   
})
const upload = multer({storage:storage})

// Public route - anyone can view categories
categoryRouter.get("/list",fetchCategories)
// Admin routes - require admin authentication
categoryRouter.post("/addCategory",authAdmin,upload.single("image"),requireFileUpload,validateImageUpload,validate(categorySchema),addCategory)
categoryRouter.get('/fetchEditedCateg',authAdmin,fetchEditedCategory)
categoryRouter.post('/editCategory',authAdmin,upload.single("image"),validateImageUpload,validate(editCategorySchema),editCategory)
categoryRouter.post('/removeCategory',authAdmin,validate(removeCategorySchema),removeCategory)


export default categoryRouter