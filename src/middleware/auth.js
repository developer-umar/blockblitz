//authorization 
// ye banega hamra Uuse rmeodle ke baad 

import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt from "jsonwebtoken"




 export const verifyJwt  = asyncHandler(async(req, _ ,next)=>{

   try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    // console.log("token : ",token);  ye hameshaq not defined aaega 
 
    if(!token){
      throw new ApiError(401,"Unauthorized request");
 
    }
    //phle decode karo 
    //verify karo  token jo details  aai hi wo shi hai ya nhi 
 
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   
 
   // ham logo ne schema me signin() me ._id hi dia hai 
   const user =  await User.findById(decodedToken?._id).select("-password -refreshToken");
  //  console.log("the user is :",user);
 
   if(!user){
    
     throw new ApiError(401,"Invalid Access Token")
   }
   // agar usr hai to  naya object addd karenge usertaaki controllers bina db calla kye acces karle user ko
   console.log(user)
   req.user = user;
   console.log(req.user);
   next();
   } catch (error) {
    
     throw new ApiError(401,error?.message || "Invalid access token ")
   }
})


  

