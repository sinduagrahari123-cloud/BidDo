import Auction from "../models/auction.model.js";
import Item from "../models/item.model.js"


const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'BID-'
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export const createAuction = async (req, res) => {
    try {
        const { title, category, settings } = req.body;
        const roomCode = generateRoomCode();

        const auction = await Auction.create({
            title,
            category,
            roomCode,
            organizer: req.user._id,
            settings
        })

        return res.status(201).json({
            message: "Auction created successfully",
            auction
        })
    }

    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}



export const joinAuction = async (req, res) => {
    try {
        const { roomCode, desiredRole, teamName, basePrice } = req.body;
        const auction = await Auction.findOne({ roomCode });
        if (!auction) {
            return res.status(404).json({ message: "Auction not found" });
        }

        const isMember = auction.members.find(member => member.userId.toString() === req.user._id.toString());
        if (isMember) {
            return res.status(400).json({ message: "User already joined the auction" });
        }

        const allowedRoles = ["bidder", "participant", "viewer"];
        const role = allowedRoles.includes(desiredRole) ? desiredRole : "viewer";

        const newMember = {
            userId: req.user._id,
            role,
            status: role === "viewer" ? "approved" : "pending",
            basePrice:role=== "participant"?Number(basePrice):undefined
        };

        if (role === "bidder") {
            newMember.teamName = teamName || "";
        }

        if (role === "participant") {
            const item = await Item.create({
                auctionId: auction._id,
                name: req.user.name,
                basePrice: Number(basePrice) || 0,
                imageUrl: req.user.avatar?.url || "",
                linkedUserId: req.user._id,
            });
            newMember.linkedItemId = item._id;
        }

        auction.members.push(newMember);
        await auction.save();

        return res.status(200).json({
            message: "Joined auction successfully",
            auction
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const approveUser = async (req, res) => {
    try {
        const { auctionId, memberId, role, status, basePrice } = req.body; // ADD basePrice
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ message: "Auction not found" });
        }
        if (auction.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const member = auction.members.id(memberId);
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }

        member.role = role;
        member.status = status;
        if (role === "bidder" && status === "approved") {
            member.remainingPurse = auction.settings.pursePerTeam;
        }
        if (role === "participant" && basePrice !== undefined) {
            member.basePrice = Number(basePrice);
            if (member.linkedItemId) {
                await Item.findByIdAndUpdate(member.linkedItemId, { basePrice: Number(basePrice) });
            }
        }
        await auction.save();
        return res.status(200).json({ message: "Member status updated successfully", auction });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const finalizeBid = (io) => async (req, res) => {
    try {


        const { auctionId, bidderId, amount } = req.body;
        const auction = await Auction.findById(auctionId);
        const organizer = auction.organizer
        if (auction.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Only organizer can finalize bid"
            })
        }
        const member = auction.members.find(
            m => m.userId.toString() === bidderId
        )
        if (!member) {
            return res.status(404).json({
                message: "Bidder not found"
            })
        }
        member.remainingPurse -= amount


        const item = await Item.findById(auction.currentItem)
        item.status = "sold"
        item.soldTo = bidderId
        item.soldAmount = amount

        auction.currentItem = null
        await auction.save()

        await item.save()


        io.to(auction.roomCode).emit("bid_finalized", {
            itemId: item._id,
            itemName: item.name,
            soldTo: bidderId,
            soldAmount: amount
        })

        return res.status(200).json({
            message: "Bid finalized successfully",
            item,
            auction
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error"
        })

    }

}

export const getAuctionByRoomCode = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const auction = await Auction.findOne({ roomCode })
            .populate("organizer", "name email avatar")
            .populate("members.userId", "name email avatar")
            .populate("currentItem");

        if (!auction) {
            return res.status(404).json({ message: "Auction not found" });
        }
        res.set('Cache-Control', 'no-store')

        return res.status(200).json({ auction });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const startAuction = (io) => async (req, res) => {
    try {
        const { auctionId } = req.body;
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ message: "Auction not found" });
        }
        if (auction.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        if (auction.status !== "waiting") {
            return res.status(400).json({ message: "Auction has already started or ended" });
        }

        auction.status = "active";
        await auction.save();

        io.to(auction.roomCode).emit("auction_started", { auctionId: auction._id });

        return res.status(200).json({ message: "Auction started successfully", auction });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const pauseAuction = (io) => async (req, res) => {
  try {
    const { auctionId } = req.body;
    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    if (auction.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (auction.status !== "active") {
      return res.status(400).json({ message: "Auction is not currently active" });
    }

    auction.status = "paused";
    await auction.save();

    io.to(auction.roomCode).emit("auction_paused", { auctionId: auction._id });
    return res.status(200).json({ message: "Auction paused", auction });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resumeAuction = (io) => async (req, res) => {
  try {
    const { auctionId } = req.body;
    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    if (auction.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (auction.status !== "paused") {
      return res.status(400).json({ message: "Auction is not currently paused" });
    }

    auction.status = "active";
    await auction.save();

    io.to(auction.roomCode).emit("auction_resumed", { auctionId: auction._id });
    return res.status(200).json({ message: "Auction resumed", auction });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const endAuction = (io) => async (req, res) => {
  try {
    const { auctionId } = req.body;
    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    if (auction.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (auction.status === "completed") {
      return res.status(400).json({ message: "Auction is already completed" });
    }

    auction.status = "completed";
    auction.currentItem = null;
    await auction.save();

    io.to(auction.roomCode).emit("auction_ended", { auctionId: auction._id });
    return res.status(200).json({ message: "Auction ended", auction });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};