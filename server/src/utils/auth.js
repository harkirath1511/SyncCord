import { ApiError } from "./apiError.js";
import { ApiResponse } from "./apiResponse.js";

export const authHandler = (req, res)=>{
    
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace('Bearer ', "");

    if(token){
        return res
        .status(200)
        .json(new ApiResponse(200, "Success"))
    }else{
        throw new ApiError(400, "No tokens found! Please login first")
    }
}
