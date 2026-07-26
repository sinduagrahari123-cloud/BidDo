import Vote from "../models/vote.model.js";
import Auction from "../models/auction.model.js"
import Bid from "../models/bid.model.js"

export const requestVote = (io) => async (req, res) => {
    try {
        const { auctionId, type, targetMemberId, amount } = req.body
        const auction = await Auction.findById(auctionId)
        if (!auction) {
            return res.status(400).json({
                message: "Auction not found"
            })
        }
        if (auction.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json(
                {
                    message: "Unauthorized"
                }
            )
        }

        if (type === "undo" && !(auction.currentBid?.amount > 0)) {
            return res.status(400).json({ message: "No active bid to undo" });
        }

        const vote = await Vote.create({
            auctionId: auctionId,
            type: type,
            targetMemberId: targetMemberId,
            amount: amount,
            requestedBy: req.user._id
        })

        io.to(auction.roomCode).emit("vote_requested", {
            voteId: vote._id,
            type: vote.type,
            requestedBy: req.user._id,
            targetMemberId,
            amount
        })
        return res.status(201).json({
            message: "Vote requested successfully",
            vote
        })

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }

}

export const castVote = (io) => async (req, res) => {
    try {
        const { voteId, decision } = req.body
        const vote = await Vote.findById(voteId)

        console.log("Vote ID:", vote._id);
        console.log("Votes before push:", vote.votes.length);
        console.log("Votes array:", vote.votes);

        if (!vote) {
            return res.status(404).json({
                message: "Vote not found"
            })
        }
        if (vote.status !== "pending") {
            return res.status(400).json({
                message: "Vote already completed"
            })
        }
        console.log("Current user:", req.user._id.toString())
        const alreadyVoted = vote.votes.find(v => v.bidderId.toString() === req.user._id.toString());
        if (alreadyVoted) {
            return res.status(400).json({ message: "You have already voted" });
        }

        vote.votes.push({
            bidderId: req.user._id,
            decision
        })

        console.log("Votes after push:", vote.votes.length);

        await vote.save();

        const checkVote = await Vote.findById(voteId);
        console.log("Votes in DB after save:", checkVote.votes.length);

        const auction = await Auction.findById(vote.auctionId)
        const totalBidders = auction.members.filter(
            m => m.role === "bidder" && m.status === 'approved').length


        const rejected = vote.votes.find(v => v.decision === "reject")
        if (rejected) {
            vote.status = "rejected"
            await vote.save()
            io.to(auction.roomCode).emit("vote_completed", { type: vote.type, status: "rejected" })
            return res.status(200).json({ message: "Vote rejected", vote })



        }

        auction.members.forEach((m) => {
            console.log({
                role: m.role,
                status: m.status,
                userId: m.userId,
                purse: m.remainingPurse
            })
        })

        console.log('votes', vote.votes.length, 'total bidder', totalBidders)

        if (vote.votes.length === totalBidders) {
            vote.status = "approved"
            await vote.save()
            if (vote.type === "purseIncrease") {
                auction.members.forEach(m => {

                    if (m.role === "bidder" && m.status === "approved") {
                        m.remainingPurse += vote.amount;
                    }
                });
                await auction.save()
            }

            if (vote.type === "undo") {



                await Bid.findOneAndDelete({
    auctionId: auction._id,
    itemId: auction.currentItem,
    bidderId: auction.currentBid.bidderId,
    amount: auction.currentBid.amount
});

const lastBid = await Bid.findOne({
    auctionId: auction._id,
    itemId: auction.currentItem,
}).sort({ createdAt: -1 });

if (lastBid) {
    auction.currentBid = {
        amount: lastBid.amount,
        bidderId: lastBid.bidderId,
    };

    const secondLastBid = await Bid.findOne({
        auctionId: auction._id,
        itemId: auction.currentItem,
        _id: { $ne: lastBid._id }
    }).sort({ createdAt: -1 });

    auction.previousBid = secondLastBid
        ? {
            amount: secondLastBid.amount,
            bidderId: secondLastBid.bidderId,
        }
        : {
            amount: 0,
            bidderId: null,
        };
} else {
    const item = await Item.findById(auction.currentItem);

    auction.currentBid = {
        amount: item.basePrice,
        bidderId: null,
    };

    auction.previousBid = {
        amount: 0,
        bidderId: null,
    };
}

await auction.save();

            }

            io.to(auction.roomCode).emit("vote_completed", {
                type: vote.type,
                status: "approved"
            })
        }


        return res.status(200).json({ message: "Vote cast successfully", vote })


    }

    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }




}
