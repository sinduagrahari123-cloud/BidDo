import express from 'express';
import {createAuction,joinAuction,approveUser, finalizeBid,getAuctionByRoomCode,startAuction,pauseAuction,resumeAuction,endAuction} from '../controllers/auction.controller.js';
import {protect} from '../middleware/auth.middleware.js';


const auctionRoutes = (io) =>{

const router = express.Router();

router.post('/create', protect, createAuction);

router.post('/join', protect, joinAuction);

router.get('/room/:roomCode', protect, getAuctionByRoomCode);

router.put('/approve', protect, approveUser);

router.post('/start', protect, startAuction(io));

router.post('/finalize',protect,finalizeBid(io))


router.post('/pause', protect, pauseAuction(io));
router.post('/resume', protect, resumeAuction(io));
router.post('/end', protect, endAuction(io));


return router
}

export default auctionRoutes;