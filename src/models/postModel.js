import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",   // relation with User kisne post bnai 
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ["Technology", "Entertainment", "Politics", "Education"], //adeed ctaegory for filter blogs
    required: true

  },

  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ""
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"     // which users liked the post
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Post = mongoose.model("Post", postSchema);
