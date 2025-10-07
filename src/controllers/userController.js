import { User } from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAcessTokenAndRefreshTokens = async (userId) => {


    try {
        const user = await User.findById(userId);

        const acessToken =await  user.generateAcessToken();
        const refreshToken = await  user.generateRefreshToken();

        user.refreshToken = refreshToken;


        return { acessToken, refreshToken };



    } catch (error) {


        throw new ApiError(400, "something went wrong in generating acess and refresh tokens ");

    }


}

export const registerUser = asyncHandler(async (req, res) => {

    const { username, email, password, bio } = req.body;

    if ([username, email, password,bio].some((field) => field?.trim() === "")) {

        throw new ApiError(400, "All fields are required ")

    }

    const existedUser = await User.findOne({
        $or: [ { username: username },
        { email: email }]
    })


    if (existedUser) {

        throw new ApiError(409, "user already exists please login ")

    }

    const avatarlocalPath = await req.files?.avatar[0]?.path;
    console.log("avtar local path ",avatarlocalPath)
    const coverImagelocalPath =  await req.files?.coverImage[0]?.path;
    console.log("cover image  local path ",coverImagelocalPath)



    if (!avatarlocalPath) {
        throw new ApiError(409, "avatar is required");
    }
    if (!coverImagelocalPath) {
        throw new ApiError(409, "coverImage is required");
    }

    const avatar = await uploadonCloudinary(avatarlocalPath);
    const coverImage = await  uploadonCloudinary(coverImagelocalPath);
    

    if (!avatar) {
        throw new ApiError(409, "avatar is required");
    }
    if (!coverImage) {

        throw new ApiError(409, "CoverImage  is required");
    }


    const user = await User.create({

        username,
        email,
        password,
        bio,
        avatar: avatar.url,
        coverImage: coverImage.url

    })


    const createdUser = await User.findById(user._id).select("-password  -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong in creatung User ");

    }



    return res.status(201).json(

        new ApiResponse(200, createdUser, "User registered successfully")
    )



})


export const loginUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(401, "username and password is required ")
    }

    const user = await User.findOne({
        $or: [{ username, email }]
    })


    if (!user) {
        throw new ApiError(404, "User does not exists  please register ")
    }


    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(409, "invalid password  try again ")

    }

    const { acessToken, refreshToken } = await generateAcessTokenAndRefreshTokens(user._id);


    const LoggedInUser = await User.findById(user._id).select("-password -refreshToken");


    const options = {
        httpOnly: true,          // iska matlab frontend JS code se cookie ko access/modify nahi kar sakte
        secure: true     // iska matlab cookie sirf HTTPS connection par hi bheji jayegi
    }

    return res.status(200)
    .cookie("accessToken",acessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,LoggedInUser,"user logged in sueceesfully"))

})
// logout user 


export const logoutUser = asyncHandler(async (req, res) => {
  //findbyIdandupdate do cheeze leta hai user find kaise kare ar doosra value kisi update karni hai
  //  new true kar denge to jo  nyi value milega wo updatted hogi 
  // fir cookies ko clear karna hai 


  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "user logged out succesfully "))

})


// acces refresh token 
export const getCurrentUser = asyncHandler(async (req, res) => {

 return res.status(200).json(
  new ApiResponse(200, req.user, "Current user fetched successfully")
);
})


export const refreshAccessToken = asyncHandler(async (req, res) => {

  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  //agar refresh token nhi mila to error do 
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  //agar mil gya refersh token   check karo phle shi hai ya nhi fir  naya token geenrate kerenge 
  //verify() phle decrypt karta hai fir compare karta hai 
  try {

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);



    //agar mil gya  to mai user ki id se user ka datat managawa ka nayaya acces token ar refrshj token geneenrate karke  chipka kar bhej dunga


    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    //check karenge donon  same hain ya nhi 

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used ")
    }

    //new refersh token generated 

    const { accessToken, refreshToken } = await generateAcessTokenAndRefreshTokens(user._id);

    const updateduser = await   User.findById(user._id).select("-password -refreshToken")


    const options = {
      httpOnly: true, 
      secure: true
    //   secure: process.env.NODE_ENV === "production"  
    }
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(
        200, {

        user: updateduser,
        refreshToken,
        accessToken

      },
        "refershToken generated successfully "


      ))
  } catch (error) {

    throw new ApiError(401, error?.message || "Invalid refresh token ")

  }


})












