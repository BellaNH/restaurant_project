import express from "express"
import { addFood, listFood, removeFood ,editFood,fetchEditedFood} from "../controllers/foodcontroller.js"
import multer from "multer"

const foodRouter = express.Router();


const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        const filename = `${Date.now()}${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({storage:storage})
foodRouter.post("/add",upload.single("image"),addFood)
foodRouter.get("/list",listFood)
foodRouter.post("/remove",removeFood)
foodRouter.post("/edit",upload.single("image"),editFood)
foodRouter.get("/fetchEditedFood",fetchEditedFood)
export default foodRouter;