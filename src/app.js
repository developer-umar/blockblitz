import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
dotenv.config();  // Load .env

const app = express()

app.use(cors({
  origin:"*"
}));


app.use(express.json());   
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())




// routes 
import  userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"
import aiRoutes from "./routes/AiContentRoutes.js"


// routes 

app.use("/api/v1/user",userRoutes);
app.use("/api/v1/post",postRoutes);
app.use("/api/v1/comment",commentRoutes);
app.use("/api/v1/ai",aiRoutes);





export { app }

