import jwt from "jsonwebtoken";
import User from "../models/user.model.js"

export const protect = async (req, res, next) => {
    try {


        const token = req.headers.authorization?.split(" ")[1]
        console.log("Token:", token)
        console.log(req.user)

        

        if(!token){
            return res.status(401).json({
                message: "Not authorized"
            })
        }


        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(401).json({message:"User not found"})
        }
        
        req.user = user
        next()

    } catch (error) {
        console.log("JWT error:",error.name);
        console.log("JWT verify error:",error.message);
        
        return res.status(401).json({
            message: "Not authorized"
        })
    }
}