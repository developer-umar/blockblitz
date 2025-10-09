import { Comment } from "../models/commentModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";




export const  postComment = asyncHandler(async(req,res)=>{

    const {postId} = req.params;
    const {message} = req.body;

    if(!mongoose.isValidObjectId(postId)){
        return res(404).json({message:"invalid post id "});


    }

     if(message.length <1  || message.length >100){
        return res.status(404).json({message:"enetr appropriate length of comment "});

     }

     const  new_message = await Comment.create({
        postId:postId,
        authorId:req.user._id,
        message:message

     })


     if(!new_message){

     return res.status(500).json({message:"comment not inserted "})

     }

     


     return  res.status(200).json(
        new ApiResponse(201,new_message,"comment inserted  succefully ")
     );


})

// post 

 export const  getCommentsById = asyncHandler(async(req,res)=>{

    const {postId} = req.params; 


     if(!mongoose.isValidObjectId(postId)){
        return res(404).json({message:"invalid post id "});


    }

    const comments = await   Comment.aggregate([
        // post ki id match karo  

        {
            $match:{
                postId: new mongoose.Types.ObjectId(postId)
            
            }
        },

        // join karan user ka data 


        {
            $lookup:{
                from:"users",
                localField:"authorId",
                foreignField:"_id",
                as:"author"

            }
        },

        // author ek arary hai isko normal object me ocnvert klaro 
        // jab ek baar create ho jaat hai jaise author wo ek atatribute ban gya usko $se hi acces karte hain


        {$unwind:"$author"},

        // khli necessry  fields  mangwao

        {
            $project:{
                message:1,
                createdAt:1,
                "author.username":1,
                "author.avatar":1,


            }
        },
        // sort by newest  commnet 

        {
            $sort:{createdAt:-1}
        }



    ])



if (!comments || comments.length < 1) {
    return res.status(404).json({ message: "No comments found" });
  }

  // ✅ Send response
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));


 });


//  khali  jisne post create kia hai ar jisme commnet likha hai wo hi commnet khli delte kar skta hai 
export const deleteCommentById = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // ✅ Validate commentId (must be a valid MongoDB ObjectId)
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  // ✅ Aggregation pipeline to get comment + post author info in **1 DB call**
  const result = await Comment.aggregate([
    // 1️⃣ Match the specific comment by its _id
    { $match: { _id: new mongoose.Types.ObjectId(commentId) } },

    // 2️⃣ Lookup corresponding post info from posts collection
    {
      $lookup: {
        from: "posts",         // Collection name: posts
        localField: "postId",  // Comment's postId
        foreignField: "_id",   // Post's _id
        as: "post",            // Output array field
      },
    },

    // 3️⃣ Convert post array to single object (because lookup returns array)
    { $unwind: "$post" },

    // 4️⃣ Project only required fields
    {
      $project: {
        _id: 1,                   // Comment's _id
        message: 1,               // Comment text
        authorId: 1,              // Comment author ID (user who wrote the comment)
        postAuthorId: "$post.authorId", // Post author's ID (user who created the post)
      },
    },
  ]);

  // ✅ Check if comment exists
  if (!result || result.length === 0) {
    throw new ApiError(404, "Comment not found");
  }

  // 🔹 Extract the first (and only) comment object
  const commentData = result[0];

  // ✅ Authorization check:
  // Comment can be deleted by:
  // 1️⃣ Comment author (authorId)
  // 2️⃣ Post author (postAuthorId)
  if (
    commentData.authorId.toString() !== req.user._id.toString() &&
    commentData.postAuthorId.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not allowed to delete this comment");
  }

  // ✅ Delete the comment by its _id
  await Comment.deleteOne({ _id: commentId });

  // ✅ Send response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});