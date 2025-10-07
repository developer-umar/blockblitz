import mongoose from "mongoose";
import { Post } from "../models/postModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";



// create post 
export const createPost = asyncHandler(async (req, res) => {

    const { title, content } = req.body;

    if (!title || !content) {
        throw new ApiError(400, "title  and content is required ");
    }

    let imagelocalpath = await req.files?.image[0]?.path;

    if (!imagelocalpath) {
        throw new ApiError(400, "image local path is required ")
    }

    const image = await uploadonCloudinary(imagelocalpath);

    if (!image) {
        throw new ApiError(400, "image not uploaded path required ")
    }

    const post = await Post.create({
        authorId: req.user._id,
        title,
        content,
        image: image.url
    })


    await post.populate("authorId", "avatar");

    return  res.status(201).json(new ApiResponse(200, post, "post created sucessfully...."))




})
// get ll post with author information 
// ye ssare post jo hamre diplay honge sare 




export const getAllPosts = asyncHandler(async (req, res) => {

    const posts =  await Post.aggregate([

    {
        $lookup:{

            from:"users",   //mongi db me jo collection ka naam dia hai  from matalb kis collection se join karna hai 
            localField:"authorId",       //post   me jo  atrubute  common dono me 
            foreignField:"_id",            //user collectionki id jiske basis pr join karenge 
            as:"author"    ,          // ye ek array aaega 

        }
    },

        {
            $unwind:"$author"     //author ek naya attribute ban gya is liye $se acces kia ar ye array ko normal objetc me convert karta hai 
        },


        {                 //jo zarrori attributes hai khli whi manwange 
            $project:{
                title:1,
                // content:1,                       
                image:1,
                createdAt:1,
                "author.username":1,
                "author.avatar":1

            }
        }

    ])


  //post ar post  ki length matlb kitni post hai  usi hissab se itertae karnge 
    return res.status(200).json(
        new ApiResponse(200,{count:posts.length, posts})
    )





});



// 📌 Get single post by Id (with author + comments)  detailed  

export const getpostbyId = asyncHandler(async(req,res)=>{


    const   {postId} = req.params;

     if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

    const post = await  Post.aggregate([
    //  post ki id match kar rahe 

        {
         $match:{
            _id:new mongoose.Types.ObjectId(postId)      //is post id atch karo 
         }

        },
        //  user ka datat attach karne ke liye 
        {
            $lookup:{
                from:"users",
                localField:"authorId",
                foreignField:"_id",
                as:"author"
            }

        },
        {
            $unwind:"$author"                       //array ko normla object me conevrt kar rahe 

        },
        // comnet collection add karne ke liye 
        {
            $lookup:{
                from:"comments",        
                localField:"_id",       //post ki id 
                foreignField:"postId",   //coment keandr post ki id 
                as:"comments"



            }
        },

        {
            $project:{
                title:1,
                content:1,
                image:1,
                likes:1,
                createdAt:1,
                "author.username":1,
                "author.avatar":1,
                comments:1


            }
        }
    ])

    if(!post  || post.length ===0){
        throw new ApiError(404, "Post not found");
    }

    return res.status(200).json(new ApiResponse(200, post[0],"post  fetched succesfully"));






})
// note jo bhi freighn field ar loacl field loge wo  jis  collection ke object se db se query karte hai uske point of view se sochna hamesha 


// update post nhi rkha hai masla 

// delete post 

export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Check ownership
  if (post.authorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  await post.deleteOne();

  res.status(200).json(new ApiResponse(200,{},"post  deleted succesfully "));
  
});




















