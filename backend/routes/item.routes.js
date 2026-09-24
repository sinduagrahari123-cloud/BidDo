import express from "express";

import {
    createItem,
    bulkCreateManualItems,
    nominateItem,
    markItemUnsold
} from "../controllers/item.controller.js";

import { protect } from "../middleware/auth.middleware.js";


const itemRoutes = (io) => {
    const router = express.Router();


    // Create single item
    router.post(
        "/create",
        protect,
        createItem
    );


    // ==================================================
    // NEW: Add multiple manual participants
    // ==================================================
    router.post(
        "/bulk-create-manual",
        protect,
        bulkCreateManualItems
    );


    // Nominate item
    router.post(
        "/nominate",
        protect,
        nominateItem(io)
    );


    // Mark item unsold
    router.post(
        "/mark-unsold",
        protect,
        markItemUnsold(io)
    );


    return router;
};


export default itemRoutes;