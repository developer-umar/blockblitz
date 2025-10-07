import { app } from "./app.js"

import dotenv from "dotenv"
import { connectDB } from "./db/index.js"


dotenv.config({path:'./.env'})




connectDB()
.then(()=>{

    app.listen(process.env.PORT,()=>{
        console.log(`app is running on the  on http://localhost:${process.env.PORT}`)
    })

}).catch((error)=>{
      console.log("mongo db connection failed !!!!!!",error)
})