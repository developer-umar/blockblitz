import  {  v2 as cloudinary }from "cloudinary"

import fs from "fs"

import dotenv from "dotenv"
dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,                             //conncetion kar rha hai 
    api_secret:process.env.CLOUDINARY_API_SECRET
});

// export const    uploadonCloudinary = async(localFilePath)=>{


//     try {

//         if(!localFilePath)   return null;


//         const response =  await cloudinary.uploader.upload(localFilePath,{
//             resource_type:"auto"
//         })

//          if(response){
//             console.log("file uploaded on cloudinary..... ")
//          }

//           fs.unlinkSync(localFilePath)


//          return  response;


        
//     } catch (error) {

//           if (fs.existsSync(localFilePath)) {
//         fs.unlinkSync(localFilePath);
//     }
        
//         console.log("file not !!! uploaded  on  clouidnary...")
//         return null;
//     }
        
    
// }

// oopr walal code local file path se upload kar rha tha render pr nhi ho paa rha tha ku ki uslo temp folder nhi mil rha isliye ye use karna pada 

export const uploadonCloudinary = async (fileBuffer) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload failed:", error);
            reject(error);
          } else {
            console.log("File uploaded to Cloudinary ");
            resolve(result);
          }
        }
      );

      uploadStream.end(fileBuffer); // send buffer data
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};
