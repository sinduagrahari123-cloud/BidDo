import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import Comment from "../models/comment.model.js";
import Item from "../models/item.model.js";
import User from "../models/user.model.js";


export const auctionSocket = (io) => {

    io.on(
        "connection",
        (socket) => {

            console.log(
                "A user connected",
                socket.id
            );


            // ==================================================
            // JOIN ROOM
            // ==================================================
            socket.on(
                "join_room",
                (roomCode) => {

                    socket.join(roomCode);


                    console.log(
                        `User with ID: ${socket.id} joined room: ${roomCode}`
                    );


                    io.to(roomCode).emit(
                        "user_joined",
                        {
                            message:
                                "A new user has joined the auction room.",

                            socketId:
                                socket.id
                        }
                    );
                }
            );


            // ==================================================
            // PLACE BID
            // ==================================================
            socket.on(
                "place_bid",
                async (data) => {

                    try {

                        const {
                            roomCode,
                            amount,
                            bidderId
                        } = data;


                        const auction =
                            await Auction.findOne({
                                roomCode
                            });


                        if (!auction) {

                            socket.emit(
                                "bid_error",
                                {
                                    message:
                                        "Auction not found"
                                }
                            );

                            return;
                        }


                        if (
                            auction.status !==
                            "active"
                        ) {

                            socket.emit(
                                "bid_error",
                                {
                                    message:
                                        "Auction is not active"
                                }
                            );

                            return;
                        }


                        if (
                            !auction.currentItem
                        ) {

                            socket.emit(
                                "bid_error",
                                {
                                    message:
                                        "No item is currently being auctioned"
                                }
                            );

                            return;
                        }


                        // ==================================================
                        // 30 SECOND TIMER CHECK
                        // ==================================================
                        if (
                            auction.settings.bidTimerEnabled &&
                            auction.currentItemStartedAt
                        ) {

                            const elapsed =
                                (
                                    Date.now() -
                                    new Date(
                                        auction.currentItemStartedAt
                                    ).getTime()
                                ) / 1000;


                            if (
                                elapsed >=
                                auction.settings.bidTimerSeconds
                            ) {

                                socket.emit(
                                    "bid_error",
                                    {
                                        message:
                                            "Bidding time has ended for this player"
                                    }
                                );

                                return;
                            }
                        }


                        const item =
                            await Item.findById(
                                auction.currentItem
                            );


                        if (!item) {

                            socket.emit(
                                "bid_error",
                                {
                                    message:
                                        "Current item not found"
                                }
                            );

                            return;
                        }


                        const minRequired =
                            auction.currentBid.amount > 0
                                ? auction.currentBid.amount
                                : item.basePrice;


                        if (
                            amount <=
                            minRequired
                        ) {

                            socket.emit(
                                "bid_error",
                                {
                                    message:
                                        `Bid must be higher than ₹${minRequired}`
                                }
                            );

                            return;
                        }


                        // ==================================================
                        // CHECK BIDDER
                        // ==================================================
                        const bidder =
                            auction.members.find(
                                (member) =>
                                    member.userId?.toString() ===
                                    bidderId?.toString() &&
                                    member.role === "bidder" &&
                                    member.status === "approved"
                            );


                        if (!bidder) {

                            socket.emit(
                                "bid_error",
                                {
                                    message:
                                        "You are not an approved bidder in this auction"
                                }
                            );

                            return;
                        }


                        // ==================================================
                        // CHECK PURSE
                        // ==================================================
                        if (
                            amount >
                            bidder.remainingPurse
                        ) {

                            socket.emit(
                                "bid_error",
                                {
                                    message:
                                        "Bid exceeds your remaining purse"
                                }
                            );

                            return;
                        }


                        // ==================================================
                        // SAVE BID
                        // ==================================================
                        await Bid.create({
                            auctionId:
                                auction._id,

                            itemId:
                                auction.currentItem,

                            bidderId,

                            amount
                        });


                        auction.previousBid =
                            auction.currentBid;


                        auction.currentBid = {
                            amount,
                            bidderId
                        };


                        // ==================================================
                        // IMPORTANT:
                        // RESET TIMER AFTER EVERY SUCCESSFUL BID
                        // ==================================================
                        if (
                            auction.settings
                                .bidTimerEnabled
                        ) {

                            auction.currentItemStartedAt =
                                new Date();

                        } else {

                            auction.currentItemStartedAt =
                                null;
                        }


                        await auction.save();


                        // ==================================================
                        // BROADCAST NEW BID
                        // ==================================================
                        io.to(
                            roomCode
                        ).emit(
                            "new_bid",
                            {
                                amount,

                                bidderId,

                                itemId:
                                    auction.currentItem,

                                timestamp:
                                    new Date(),

                                // Send new timer start
                                // to every client
                                currentItemStartedAt:
                                    auction.currentItemStartedAt
                            }
                        );


                    } catch (error) {

                        console.error(
                            "Error placing bid:",
                            error
                        );


                        socket.emit(
                            "bid_error",
                            {
                                message:
                                    "An error occurred while placing the bid."
                            }
                        );
                    }
                }
            );


            // ==================================================
            // COMMENTS
            // ==================================================
            socket.on(
                "send_comment",
                async (data) => {

                    try {

                        const {
                            roomCode,
                            userId,
                            message
                        } = data;


                        const auction =
                            await Auction.findOne({
                                roomCode
                            });


                        if (!auction) {
                            return;
                        }


                        const comment =
                            await Comment.create({
                                auctionId:
                                    auction._id,

                                userId,

                                message
                            });


                        const commentUser =
                            await User.findById(
                                userId
                            ).select(
                                "name"
                            );


                        io.to(
                            roomCode
                        ).emit(
                            "new_comment",
                            {
                                commentId:
                                    comment._id,

                                userId,

                                userName:
                                    commentUser?.name ||
                                    "Unknown",

                                message,

                                timestamp:
                                    comment.createdAt
                            }
                        );


                    } catch (err) {

                        console.log(err);


                        socket.emit(
                            "comment_error",
                            {
                                message:
                                    "Failed to send comment"
                            }
                        );
                    }
                }
            );


            // ==================================================
            // DISCONNECT
            // ==================================================
            socket.on(
                "disconnect",
                () => {

                    console.log(
                        "A user disconnected",
                        socket.id
                    );
                }
            );
        }
    );
};