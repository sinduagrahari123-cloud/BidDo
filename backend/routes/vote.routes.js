import express from "express"
import { requestVote,castVote } from "../controllers/vote.controller.js"
import {protect} from "../middleware/auth.middleware.js"


const voteRoutes = (io) => {
    const router = express.Router()

    router.post("/request",protect,requestVote(io))
    router.post("/cast",protect,castVote(io))


    return router

}

export default voteRoutes