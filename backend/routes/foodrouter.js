import express from "express"
import { addFood, listFood, removeFood ,editFood,fetchEditedFood} from "../controllers/foodcontroller.js"
import multer from "multer"
import authAdmin from "../middleware/authAdmin.js"
import { validate } from "../middleware/validation.js"
import { foodSchema, editFoodSchema, removeFoodSchema } from "../middleware/validationSchemas.js"
import { validateImageUpload, requireFileUpload } from "../middleware/fileUploadValidation.js"

const foodRouter = express.Router();


const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        const filename = `${Date.now()}${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({storage:storage})
// Public route - anyone can view food list
foodRouter.get("/list",listFood)
// Admin routes - require admin authentication
foodRouter.post("/add",authAdmin,upload.single("image"),requireFileUpload,validateImageUpload,validate(foodSchema),addFood)
foodRouter.post("/remove",authAdmin,validate(removeFoodSchema),removeFood)
foodRouter.post("/edit",authAdmin,upload.single("image"),validateImageUpload,validate(editFoodSchema),editFood)
foodRouter.get("/fetchEditedFood",authAdmin,fetchEditedFood)
export default foodRouter;