import mongoose from "mongoose";

const commentSchema= new mongoose.Schema({
    auctionId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Auction"

    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"

    },
    message:{
        type:String,
        required:true

    }

    
},{timestamps:true})

export default mongoose.model("Comment",commentSchema)