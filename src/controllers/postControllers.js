import mongoose, { mongo } from "mongoose";
import { Post } from "../models/postModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";



// create post 
// export const createPost = asyncHandler(async (req, res) => {

//   const { title, content, category } = req.body;

//   if (!title || !content || !category) {
//     throw new ApiError(400, "title  and content and category  is required ");
//   }

//   let imagelocalpath = await req.files?.image[0]?.path;

//   if (!imagelocalpath) {
//     throw new ApiError(400, "image local path is required ")
//   }

//   const image = await uploadonCloudinary(imagelocalpath);

//   if (!image) {
//     throw new ApiError(400, "image not uploaded path required ")
//   }

//   const post = await Post.create({
//     authorId: req.user._id,
//     title,
//     content,
//     category,
//     image: image.url
//   })


//   await post.populate("authorId", "avatar");

//   return res.status(201).json(new ApiResponse(200, post, "post created sucessfully...."))




// })
// get ll post with author information 
// ye ssare post jo hamre diplay honge sare 
//  oopr walal nhi chal rha tha kuki  local file path render nhi le paa rah tha


export const createPost = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    throw new ApiError(400, "title, content, and category are required");
  }

  //  Access uploaded file
  const file = req.files?.image?.[0];
  if (!file) {
    throw new ApiError(400, "image is required");
  }

  //  Upload directly from memory to Cloudinary
  const image = await uploadonCloudinary(file.buffer);
  if (!image) {
    throw new ApiError(400, "Image upload failed");
  }

  //  Create new post in DB
  const post = await Post.create({
    authorId: req.user._id,
    title,
    content,
    category,
    image: image.secure_url, //  Use Cloudinary’s secure URL
  });

  await post.populate("authorId", "avatar");

  return res
    .status(201)
    .json(new ApiResponse(200, post, "Post created successfully "));
});




export const getAllPosts = asyncHandler(async (req, res) => {

  const posts = await Post.aggregate([

    {
      $lookup: {

        from: "users",   //mongi db me jo collection ka naam dia hai  from matalb kis collection se join karna hai 
        localField: "authorId",       //post   me jo  atrubute  common dono me 
        foreignField: "_id",            //user collectionki id jiske basis pr join karenge 
        as: "author",          // ye ek array aaega 

      }
    },

    // {
    //   $unwind: "$author"     //author ek naya attribute ban gya is liye $se acces kia ar ye array ko normal objetc me convert karta hai 
    // },


    {
    $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true // Yeh zaroori hai!
    }
},

    {
      $addFields: {
        likeCount: { $size: "$likes" } // ✅ add like count
      }
    },


    {                 //jo zarrori attributes hai khli whi manwange 
      $project: {
        title: 1,
        content: 1,
        image: 1,
        createdAt: 1,
        likeCount:1,
        "author.username": 1,
        "author.avatar": 1

      }
    }

  ])


  //post ar post  ki length matlb kitni post hai  usi hissab se itertae karnge 
  return res.status(200).json(
    new ApiResponse(200, { count: posts.length, posts })
  )





});



// 📌 Get single post by Id (with author + comments)  detailed  

export const getpostbyId = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  // ✅ Validate postId
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  // ✅ Aggregation pipeline to fetch post + author info + likes count
  const post = await Post.aggregate([
    // 1️⃣ Match the specific post
    {
      $match: {
        _id: new mongoose.Types.ObjectId(postId),
      },
    },
    // 2️⃣ Lookup author data from users collection
    {
      $lookup: {
        from: "users",          // collection name in MongoDB
        localField: "authorId", // field in Post
        foreignField: "_id",    // field in User
        as: "author",
      },
    },
    // 3️⃣ Convert author array to object
    // { $unwind: "$author" },
    {
    $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true // Yeh zaroori hai!
    }
},
    // 4️⃣ Add likes count (total number of likes)
    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },
    // 5️⃣ Project only required fields to optimize payload
    {
      $project: {
        title: 1,
        content: 1,
        image: 1,
        createdAt: 1,
        likesCount: 1,              // include likes count
        "author.username": 1,
        "author.avatar": 1,
        // comments removed completely
      },
    },
  ]);

  // ✅ Check if post exists
  if (!post || post.length === 0) {
    throw new ApiError(404, "Post not found");
  }

  // ✅ Send response
  return res
    .status(200)
    .json(new ApiResponse(200, post[0], "Post fetched successfully"));
});

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

  res.status(200).json(new ApiResponse(200, {}, "post  deleted succesfully "));

});


// toggle like 
// yha aao post id nikalo  user ki id nikalo dekho wo user likes array me hai ki nhi is particular  post ki likes arary me  matlab is user ne laready like kia hai to unlike kar do agar like nhi kia to like kar do smmjhe .
// Mongoose ka ObjectId object ek built-in method deta hai — .equals()
// Jo ObjectId ko string ya ObjectId dono se safely compare karta hai.
// optimization:
//1. front end me debouncing use karna smjhe  taaki bar bar user like  unlike na kar  paae 
// 2.  ek middleware banaya taaki ek user   1 second ka baad hi like unlike kar paae usse ohle kare to server se  erro response bhej do 


// postRoutes.js

export const likePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).json({ message: "Invalid post id" });
  }

  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const objUserId = new mongoose.Types.ObjectId(userId);
  const isLiked = post.likes.some(id => id.equals(objUserId));

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    isLiked ? { $pull: { likes: objUserId } } : { $addToSet: { likes: objUserId } },
    { new: true, select: "likes" }
  );

  return res.status(200).json(new ApiResponse(
    200,
    { isLiked: !isLiked, likeCount: updatedPost.likes.length },
    "Post like toggled"
  ));
});

// //  Get posts by category filter
export const getPostsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.query;

  //  Validation
  if (!category) {
    throw new ApiError(400, "Category is required in query params");
  }

  const allowedCategories = ["Technology", "Entertainment", "Politics", "Education"];
  if (!allowedCategories.includes(category)) {
    throw new ApiError(400, "Invalid category name");
  }

  // Aggregate posts by category
  const posts = await Post.aggregate([
    //  Match category
    { $match: { category } },

    //  Join user data
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author"
      }
    },
    // { $unwind: "$author" },


    {
    $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true // Yeh zaroori hai!
    }
},

    //  Add likeCount field
    {
      $addFields: {
        likeCount: { $size: "$likes" }
      }
    },

    // Select required fields only
    {
      $project: {
        title: 1,
        content: 1,         //  added
        image: 1,
        createdAt: 1,
        category: 1,
        likeCount: 1,       //  added
        "author.username": 1,
        "author.avatar": 1
      }
    }
  ]);

  //  Send response
  return res
    .status(200)
    .json(new ApiResponse(200, { count: posts.length, posts }, "Posts fetched by category"));
});




//  searchPosts - MongoDB Atlas Search (fuzzy + latest-first)
export const searchPosts = asyncHandler(async (req, res) => {
  const q = (req.query.query || "").trim(); // user ke search input ko lo aur trim karo

  if (!q) {
    throw new ApiError(400, "Search query is required");
  }

  const agg = [
    {
      // Atlas Search Stage
      // "postSearch" — ye wahi index name hai jo tu Atlas me banaya tha
      $search: {
        index: "postSearch",
        compound: {
          should: [
            // Match title (fuzzy search: minor spelling mistake allow)
            {
              text: {
                query: q,
                path: "title",
                fuzzy: { maxEdits: 2, prefixLength: 2 }
              }
            },
            // Match content
            {
              text: {
                query: q,
                path: "content",
                fuzzy: { maxEdits: 2 }
              }
            },
            //  Match category
            {
              text: {
                query: q,
                path: "category",
                fuzzy: { maxEdits: 2 }
              }
            },
            //  Match author username
            {
              text: {
                query: q,
                path: "author.username",
                fuzzy: { maxEdits: 2}
              }
            }
          ]
        },
        highlight: { path: ["title", "content"] } // optional: highlights return karega
      }
    },

    // Add search relevance score for sorting
    { $addFields: { score: { $meta: "searchScore" } } },

    //Join author info from users collection
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "author"
      }
    },
    // { $unwind: "$author" },


    {
    $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true // Yeh zaroori hai!
    }
},
     

    // Like count compute karlo (safe for empty likes)
    { $addFields: { likeCount: { $size: { $ifNull: ["$likes", []] } } } },

    // Select only the fields needed in response
    {
      $project: {
        title: 1,
        content: 1,
        image: 1,
        category: 1,
        createdAt: 1,
        likeCount: 1,
        "author.username": 1,
        "author.avatar": 1,
        score: 1,
        highlights: { $meta: "searchHighlights" } // optional
      }
    },

    // Sort: first by search relevance (score), then by latest createdAt
    { $sort: { score: -1, createdAt: -1 } }
  ];

  // Run aggregation
  const posts = await Post.aggregate(agg);

  // ✅ Send response
  return res.status(200).json(
    new ApiResponse(200, { count: posts.length, posts }, "Search results fetched successfully")
  );
});





























