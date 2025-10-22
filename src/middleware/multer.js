// import multer from "multer";




// const storage = multer.diskStorage({



//     destination: function(req,file,cb){

//         cb(null,"./public/temp")
//     },

//     filename:function(req,file,cb){
//         cb(null,file.originalname)
//     }
    
// })

// export  const upload =   multer({storage})


// new code kuki  oppr walala local path pr phle image dalal rha tha fir server pr rnder upload nhi ho paa rha  isliye multe rke through direct cloudinary pr uoload kar rahe hain 


// multer.js
import multer from "multer";

//  Store file in memory (RAM), not on disk
const storage = multer.memoryStorage();

export const upload = multer({ storage });
