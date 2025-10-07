import mongoose, { Schema } from "mongoose";
import  bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        unique: true
    },

    email:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        unique: true


    },
    password: {
        type: String,
        required: [true, 'Password is requird'],
    },

    bio: {
        type: String,
        default: "",

    },
    avatar: {

        type: String,
        required: true,
        default: ""

    },
    coverImage:{
        type: String,
        required: true,
        default: ""

    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    refreshToken: {
        type: String,
    }



}, { timestamps: true })







userSchema.pre("save",async function(next){

    if( !this.isModified("password"))  return next();

    
      this.password = await  bcrypt.hash(this.password,10)


     next();



})

userSchema.methods.isPasswordCorrect = async function(password){

    return  await  bcrypt.compare(password,this.password)

}

userSchema.methods.generateAcessToken = async function(){

    

    return  jwt.sign(

        {
            _id: this._id,
            username:this.username,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }


    )



}

userSchema.methods.generateRefreshToken =async function(){


    return  jwt.sign(
        {
            _id : this._id,


        },
        process.env.REFRESH_TOKEN_SECRET,

        {
          expiresIn:process.env.REFRESH_TOKEN_EXPIRY  
        }
    )
}





export const User = mongoose.model("User", userSchema);