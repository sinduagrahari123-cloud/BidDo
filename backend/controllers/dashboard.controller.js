import Auction from "../models/auction.model.js"
import Item from "../models/item.model.js"
import Bid from "../models/bid.model.js"

import Comment from "../models/comment.model.js"; // add at top



export const getAuctionDetails= async (req,res) => {
    try{
        const {auctionId} = req.params
        const auction = await Auction.findById(auctionId)
        .populate("organizer","name email avatar")
        .populate("members.userId","name email avatar")
        .populate("currentItem")

        if(!auction){
            return res.status(404).json({message:"Auction not found"})

        }
        return res.status(200).json({ auction})
    }
    catch(err) {
        return res.status(500).json({
            message:"Internal server error"
           
        })
        
    }

}

export const getAuctionItems= async (req,res) =>{
    try{
        const {auctionId}=req.params
        const items = await Item.find({auctionId})

        return res.status(200).json({items})
        
        

    }

    catch(err){
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

export const getAuctionBids = async (req,res) => {
    try{
        const {auctionId}=req.params

        const bids = await Bid.find({auctionId})
        .populate("bidderId","name avatar")
        .populate("itemId","name basePrice")

    return res.status(200).json({bids})
    }
    catch(err) {
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}


export const getTeamPurses = async (req, res) => {
    try {
        const { auctionId } = req.params

        const auction = await Auction.findById(auctionId)
            .populate("members.userId", "name avatar")

        const bidders = auction.members.filter(
            m => m.role === "bidder" && m.status === "approved"
        )

        return res.status(200).json({ bidders })

    } catch(err) {
        return res.status(500).json({ 
            message: "Internal server error" 
        })
    }
}

export const getAuctionComments = async (req, res) => {
  try {
    const { auctionId } = req.params;

    console.log("auctionId from params",auctionId)
    const comments = await Comment.find({ auctionId }).populate("userId", "name");
    console.log("comments found",comments.length)
    return res.status(200).json({ comments });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};