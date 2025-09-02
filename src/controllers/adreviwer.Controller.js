import {Ad} from "../models/ads.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler";


const getallads= asyncHandler(async(req,res)=>{
   const data=await Ad.find({});
   
   
   res.json(new ApiResponse(200,data,"All Ads are getting"))
})