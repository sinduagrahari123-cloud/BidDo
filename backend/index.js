import express from "express";
import dotenv from "dotenv";
import {createServer} from "http";
import {Server} from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { protect } from "./middleware/auth.middleware.js";
import auctionRoutes from "./routes/auction.routes.js";
import { auctionSocket } from "./socket/auction.socket.js";
import itemRoutes from "./routes/item.routes.js"
import voteRoutes from "./routes/vote.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js"
import cors from 'cors'
import jwt from "jsonwebtoken";
dotenv.config();





const app =express();
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin:process.env.FRONTEND_URL||'http://localhost:5173',
        credentials:true
    }
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
   
  if (!token) {
    console.log("Socket rejected: no token");
    return next(new Error("Not authorized"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    socket.user = decoded;
    next();
  } catch (err) {
    console.log("Socket JWT error:", err.message);
    next(new Error("Not authorized"));
  }
});

auctionSocket(io);

app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL||'http://localhost:5173',
    credentials:true,
}))
app.use("/api/auth", authRoutes);
app.use("/api/auction", auctionRoutes(io));
app.use("/api/item",itemRoutes(io))
app.use("/api/vote",voteRoutes(io))
app.use("/api/dashboard",dashboardRoutes)

connectDB();


// app.listen(PORT,()=>{
//     console.log(` My server is running on port ${PORT}` )
// })

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});