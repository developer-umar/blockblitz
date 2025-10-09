import { Router } from "express";
import { verifyJwt } from "../middleware/auth.js";
import { createPost, deletePost, getAllPosts, getpostbyId, likePost } from "../controllers/postControllers.js";
import { upload } from "../middleware/multer.js";
import { likeLimiter } from "../middleware/likeLimiter.js";


const router = Router();


router.post("/create",verifyJwt,upload.fields([{name:"image",maxCount:1}]),createPost);
router.get("/getallposts",verifyJwt,getAllPosts)      //sare post display karn eke liye 
router.get("/getpost/:postId",verifyJwt,getpostbyId);
router.delete("/delete/:postId",verifyJwt,deletePost);
// toogle like  api
router.post("/like/:postId",verifyJwt,likeLimiter,likePost);






export default router;