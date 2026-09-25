import Item from "../models/item.model.js";
import Auction from "../models/auction.model.js";


export const createItem = async (req, res) => {
    try {

        const {
            name,
            basePrice,
            auctionId,
            imageUrl
        } = req.body;

        if (!name || !basePrice || !auctionId) {
            return res.status(400).json({
                message: "Some fields missing"
            });
        }

        const item = await Item.create({
            name: name,
            basePrice: basePrice,
            auctionId: auctionId,
            imageUrl: imageUrl
        });

        return res.status(201).json({
            message: "Item created successfully",
            item
        });

    } catch (error) {

        return res.status(500).json({
            message: "Internal Server error"
        });
    }
};


// ======================================================
// MANUAL PARTICIPANTS
// MAXIMUM 500
// ======================================================
export const bulkCreateManualItems = async (req, res) => {

    try {

        const {
            auctionId,
            names,
            basePrice
        } = req.body;


        if (
            !auctionId ||
            !Array.isArray(names)
        ) {
            return res.status(400).json({
                message:
                    "auctionId and names are required"
            });
        }


        const auction =
            await Auction.findById(auctionId);


        if (!auction) {
            return res.status(404).json({
                message:
                    "Auction not found"
            });
        }


        if (
            auction.organizer.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "Only organizer can add manual participants"
            });
        }


        if (auction.status !== "waiting") {
            return res.status(400).json({
                message:
                    "Manual participants can only be added before the auction starts"
            });
        }


        const price = Number(basePrice);


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {
            return res.status(400).json({
                message:
                    "Base price must be a valid non-negative number"
            });
        }


        const cleanedNames = names
            .map((name) =>
                String(name).trim()
            )
            .filter(Boolean);


        if (cleanedNames.length === 0) {
            return res.status(400).json({
                message:
                    "Enter at least one participant name"
            });
        }


        // Maximum in one request
        if (cleanedNames.length > 500) {
            return res.status(400).json({
                message:
                    "You can add a maximum of 500 participants at once"
            });
        }


        // Count existing manual participants
        const existingManualCount =
            await Item.countDocuments({
                auctionId: auction._id,
                linkedUserId: null
            });


        // Total maximum = 500
        if (
            existingManualCount +
            cleanedNames.length >
            500
        ) {
            return res.status(400).json({
                message:
                    `This auction can have a maximum of 500 manual participants. ${existingManualCount} are already added.`
            });
        }


        const items =
            await Item.insertMany(

                cleanedNames.map((name) => ({
                    auctionId:
                        auction._id,

                    name,

                    basePrice:
                        price,

                    status:
                        "pending",

                    linkedUserId:
                        null,

                    imageUrl:
                        ""
                }))
            );


        return res.status(201).json({
            message:
                `${items.length} manual participants added successfully`,

            items
        });


    } catch (err) {

        console.error(
            "bulkCreateManualItems error:",
            err
        );

        return res.status(500).json({
            message:
                "Internal server error"
        });
    }
};


// ======================================================
// NOMINATE ITEM
// ======================================================
export const nominateItem =
    (io) => async (req, res) => {

        try {

            const {
                auctionId,
                itemId
            } = req.body;


            const auction =
                await Auction.findById(
                    auctionId
                );


            if (!auction) {
                return res.status(404).json({
                    message:
                        "Auction not found"
                });
            }


            if (
                auction.organizer.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
                    message:
                        "Not authorized"
                });
            }


            if (auction.currentItem) {
                return res.status(400).json({
                    message:
                        "An item is already active for bidding"
                });
            }


            const item =
                await Item.findById(itemId);


            if (!item) {
                return res.status(404).json({
                    message:
                        "Item not found"
                });
            }


            if (item.status === "sold") {
                return res.status(400).json({
                    message:
                        "Item has already been sold"
                });
            }


            if (item.status === "active") {
                return res.status(400).json({
                    message:
                        "Item is currently being bid on"
                });
            }


            if (
                item.status === "unsold" &&
                !auction.settings.allowReauction
            ) {
                return res.status(400).json({
                    message:
                        "Re-auctioning unsold items is not allowed for this auction"
                });
            }


            item.status = "active";

            await item.save();


            auction.currentItem =
                itemId;

            auction.currentBid = {
                amount: 0,
                bidderId: null
            };

            auction.previousBid = {
                amount: 0,
                bidderId: null
            };


            // Start timer for newly nominated item
            auction.currentItemStartedAt =
                auction.settings.bidTimerEnabled
                    ? new Date()
                    : null;


            await auction.save();


            io.to(
                auction.roomCode
            ).emit(
                "item_nominated",
                {
                    item,
                    auctionId:
                        auction._id
                }
            );


            return res.status(200).json({
                message:
                    "Item nominated successfully",

                auction,

                item
            });


        } catch (err) {

            console.log(err);

            return res.status(500).json({
                message:
                    "Internal server error"
            });
        }
    };


// ======================================================
// MARK UNSOLD
// ======================================================
export const markItemUnsold =
    (io) => async (req, res) => {

        try {

            const {
                auctionId
            } = req.body;


            const auction =
                await Auction.findById(
                    auctionId
                );


            if (!auction) {
                return res.status(404).json({
                    message:
                        "Auction not found"
                });
            }


            if (
                auction.organizer.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
                    message:
                        "Not authorized"
                });
            }


            if (!auction.currentItem) {
                return res.status(400).json({
                    message:
                        "No item is currently active"
                });
            }


            const item =
                await Item.findById(
                    auction.currentItem
                );


            item.status =
                "unsold";


            await item.save();


            auction.currentItem =
                null;

            auction.currentItemStartedAt =
                null;


            await auction.save();


            io.to(
                auction.roomCode
            ).emit(
                "item_unsold",
                {
                    item,
                    auctionId:
                        auction._id
                }
            );


            return res.status(200).json({
                message:
                    "Item marked as unsold",

                auction,

                item
            });


        } catch (err) {

            console.log(err);

            return res.status(500).json({
                message:
                    "Internal server error"
            });
        }
    };