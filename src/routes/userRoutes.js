import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/userController.js";
import { upload } from "../middleware/multer.js";
import { verifyJwt } from "../middleware/auth.js";


const router =  Router()



router.post("/register",upload.fields([{name:"avatar",maxCount:1},{name:"coverImage",maxCount:1}]),registerUser);
router.post("/login",loginUser)


router.post("/logout",logoutUser);
router.get("/refresh-token",verifyJwt,refreshAccessToken)
router.get("/getuser",verifyJwt,getCurrentUser);







export  default router ;