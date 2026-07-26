import express from "express";
import { createItem,nominateItem,markItemUnsold } from "../controllers/item.controller.js";
import {protect} from "../middleware/auth.middleware.js"

const itemRoutes = (io) =>{
    const router = express.Router();

router.post("/create",protect,createItem)
router.post('/nominate', protect, nominateItem(io));
router.post('/mark-unsold', protect, markItemUnsold(io));

return router;

};

export default itemRoutes;