import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    roomCode: {
        type: String,
        required: true,
        unique: true
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: ["waiting", "active", "paused", "completed"],
        default: "waiting"
    },

    currentItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        default: null
    },

    currentBid: {
        amount: { type: Number, default: 0 },
        bidderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    },

    settings: {
        pursePerTeam: {
            type: Number,
            default: 1000
        },
        maxTeamSize: {
            type: Number,
            default: 11
        },
        minBidAmount: {
            type: Number,
            default: 10
        },
        allowReauction: {
            type: Boolean,
            default: false
        }


    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        role: {
            type: String,
            enum: ["bidder", "participant", "viewer"],
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        remainingPurse: {
            type: Number,
            default: 0

        },

        teamName: {
            type: String,
            default: ""
        },
        basePrice: {
            type: Number,
            default: 0
        },
        linkedItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            default: null
        },
        previousBid: {
            amount: { type: Number, default: 0 },
            bidderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
        },
    }]



}, { timestamps: true })

export default mongoose.model("Auction", auctionSchema)