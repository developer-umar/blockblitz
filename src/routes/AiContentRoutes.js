import { Router } from "express";
import { verifyJwt } from "../middleware/auth.js";
import { generateAiContent } from "../controllers/AiContentControllers.js";
const router = Router();

router.post("/generate", verifyJwt, generateAiContent);

export default router;
