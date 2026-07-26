import express from "express"
import { getAuctionDetails, getAuctionItems, getAuctionBids, getTeamPurses,getAuctionComments } from "../controllers/dashboard.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/:auctionId",protect,getAuctionDetails)
router.get("/:auctionId/items",protect,getAuctionItems)
router.get("/:auctionId/bids",protect,getAuctionBids)
router.get("/:auctionId/purses",protect,getTeamPurses)
router.get("/:auctionId/comments", protect, getAuctionComments);


export default router
