import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
    auctionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Auction",
        required:true
    },
    type : {
        type:String,
        enum:["undo","purseIncrease"],
        required:true
    },
    requestedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true

    },
    targetMemberId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
      amount: {
        type: Number,
        default: 0
    },
    votes: [{
        bidderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        decision: {
            type: String,
            enum: ["agree", "reject"]
        }
    }],
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
}, { timestamps: true })

export default mongoose.model("Vote", voteSchema)

