import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJwt = asyncHandler(async(req , res, next)=>{

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace('Bearer ', "");

    if(!token){
        throw new ApiError(400 , "Please login first");
    }

    const user_info = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(user_info?._id);

    if(!user){
        throw new ApiError(404, "No valid users found!" );
    }

    req.user = user
    next();
});

const SocketAuthunticator = async(err, socket, next)=>{
    try {
        const authToken = socket.request.cookies?.accessToken;

        if(!authToken){
            throw new ApiError(400, "Please login first");
        }

        const decodedData = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET );

        const user = await User.findById(decodedData?._id);
        if(!user){
            throw new ApiError(404, "No such user found");
        }
        socket.user = user;
        return next()
    } catch (error) {
        console.log(error)
        return next(new ApiError(400, "Please login to access this route"))
    }
}
export  {verifyJwt, SocketAuthunticator}
