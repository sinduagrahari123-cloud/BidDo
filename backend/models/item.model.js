import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auction",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,

    },
    status: {
        type: String,
        enum: ["pending", "active", "sold", "unsold"],
        default: "pending"
    },
    soldTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    soldAmount: {
        type: Number,
        default: 0
    },
    linkedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
}, { timestamps: true });


export default mongoose.model("Item", itemSchema);