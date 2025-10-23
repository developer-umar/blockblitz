import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"



const app = express()

app.use(cors({
  origin: function(origin, callback) {
    // origin null (Postman) ya localhost:5173 → allow
    if (!origin || origin === "http://localhost:5173") {
      callback(null, true);
    } else {
      callback(null, true); // filhaal sab allow karna
    }
  },
  credentials: true
}));

app.use(express.json());   
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())




// routes 
import  userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"


// routes 

app.use("/api/v1/user",userRoutes);
app.use("/api/v1/post",postRoutes);
app.use("/api/v1/comment",commentRoutes);





export { app }

