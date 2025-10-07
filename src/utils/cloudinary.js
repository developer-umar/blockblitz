import  {  v2 as cloudinary }from "cloudinary"

import fs from "fs"

import dotenv from "dotenv"
dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,                             //conncetion kar rha hai 
    api_secret:process.env.CLOUDINARY_API_SECRET
});

export const    uploadonCloudinary = async(localFilePath)=>{


    try {

        if(!localFilePath)   return null;


        const response =  await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

         if(response){
            console.log("file uploaded on cloudinary..... ")
         }

          fs.unlinkSync(localFilePath)


         return  response;


        
    } catch (error) {

          if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
    }
        
        console.log("file not !!! uploaded  on  clouidnary...")
        return null;
    }
        
    
}