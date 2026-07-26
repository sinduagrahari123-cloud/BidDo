import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js"
import Comment from "../models/comment.model.js"
import Item from "../models/item.model.js"
import User from "../models/user.model.js"
export const auctionSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);
        socket.on("join_room", (roomCode) => {
            socket.join(roomCode);
            console.log(`User with ID: ${socket.id} joined room: ${roomCode}`);

            io.to(roomCode).emit("user_joined", {
                message: 'A new user has joined the auction room.',
                socketId: socket.id
            });
        })

        socket.on("place_bid", async (data) => {
            try {

                const { roomCode, amount, bidderId } = data;
                const auction = await Auction.findOne({ roomCode })

                if (auction.status !== "active") {
                    socket.emit("bid_error", { message: "Auction is not active" })
                    return;
                }
                if (!auction.currentItem) {
                    socket.emit("bid_error", { message: "No item is currently being auctioned" })
                    return;
                }

                const item = await Item.findById(auction.currentItem);
                const minRequired = auction.currentBid.amount > 0 ? auction.currentBid.amount : item.basePrice;

                if (amount <= minRequired) {
                    socket.emit("bid_error", { message: `Bid must be higher than ₹${minRequired}` });
                    return;
                }


                const bid = await Bid.create({
                    auctionId: auction._id,
                    itemId: auction.currentItem,
                    bidderId,
                    amount
                });
                auction.previousBid = auction.currentBid;
                auction.currentBid = { amount, bidderId };
                await auction.save();

                io.to(roomCode).emit("new_bid", {
                    amount,
                    bidderId,
                    itemId: auction.currentItem,
                    timestamp: new Date()
                });
            }
            catch (error) {
                console.error("Error placing bid:", error);
                socket.emit("bid_error", { message: "An error occurred while placing the bid." });
            }
        }

        )
        socket.on("send_comment", async (data) => {
            try {
                const { roomCode, userId, message } = data
                const auction = await Auction.findOne({ roomCode })
                if (!auction) return

                const comment = await Comment.create({
                    auctionId: auction._id,
                    userId,
                    message

                })

                const commentUser = await User.findById(userId).select("name");

                io.to(roomCode).emit("new_comment", {
                    commentId: comment._id,
                    userId,
                    userName:commentUser.name,
                    message,
                    timestamp: comment.createdAt
                })

            }
            catch (err) {
                console.log(err)
                socket.emit("comment_error", {
                    message: "Failed to send comment"
                })
            }

        })

        socket.on("disconnect", () => {
            console.log("A user disconnected", socket.id);
        })
    });

}
