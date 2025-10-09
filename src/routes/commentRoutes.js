import { Router } from "express";
import { verifyJwt } from "../middleware/auth.js";
import { deleteCommentById, getCommentsById, postComment } from "../controllers/commentControllers.js";


const router =  Router();

router.post("/:postId",verifyJwt,postComment);
router.get("/:postId",verifyJwt,getCommentsById);
router.delete("/:commentId",verifyJwt,deleteCommentById);




export default router;