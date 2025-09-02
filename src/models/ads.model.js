import mongoose, { Schema } from "mongoose";

const adSchema=new mongoose.Schema({
   title:{
      type:String,
      required: true,
   },
   ad_type:{
      type:String,
      enum:["Video","Image"],
      default:"Image"
   },
   url:{
      type:String,
      required: true,
   },
   product_Url:{
       type:String,
      required: true,
   }
   ,createdBy:{
      type:Schema.Types.ObjectId,
      ref:"User",
      required: true,
   },
   ExpireOn:{
      type:Date,
      required: true,
   },
   Clicks:{
      type:Number,
      default:0
   },
   Views:{
      type:Number,
      default:0
   },
   PaymentId:{
      type:String,
      required: true,
   },
   Adstatus:{
      type:String,
      enum:["Pending","Approved","Blocked"],
      default:"Pending"
   }
},{timestamps:true})

export const Ad=mongoose.model("Ad",adSchema)