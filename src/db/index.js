// db connection 

import mongoose from "mongoose"

import { DBname } from "../constants.js"



export const  connectDB = async () => {

    try {

        const connectionInstance = mongoose.connect(`${process.env.MONGO_URI}/${DBname}`)

    } catch (error) {
         console.log("mongo db connection error",error);
        process.exit(1)

    }
}