import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import crypto from "crypto"
import sendEmail from "../utils/senEmail.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exist = await User.findOne({ email })

        if (exist) {
            return res.status(400).json({
                message: "User already exists"


            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        return res.status(201).json({
            message: "Registeration successful",
            user: {
                name: user.name,
                email: user.email,
                _id: user._id,
                globalRole: user.globalRole
            }
        })



    }

    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}


export const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "Either email or password is incorrect"
            })




        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                message: "Either email or password is incorrect"
            })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            message: "login succesfully",
            token,

            user: {
                name: user.name,
                email: user.email,
                _id: user._id,
                globalRole: user.globalRole
            }
        })

    }

    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.set('Cache-Control', 'no-store');


        return res.status(200).json({ user: req.user });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};




export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "biddo/avatars" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: { url: result.secure_url, public_id: result.public_id } },
            { new: true }
        ).select("-password");

        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    const resetToken = crypto
        .randomBytes(32)
        .toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordToken = hashedToken;

    user.resetPasswordExpire =
        Date.now() + 15 * 60 * 1000;

    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `
You requested a password reset.

Click the link below to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request this, please ignore this email.
`;


await sendEmail({
    email: user.email,
    subject: "Password Reset Request",
    message,
});




    return res.status(200).json({
        success: true,
        message: "Reset token generated successfully"
    })

}

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;

        const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: {
        $gt: Date.now(),
    },
});

if (!user) {
    return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
    });
}

const { password } = req.body;
const hashedPassword = await bcrypt.hash(password,10)
user.password = hashedPassword;

user.resetPasswordToken = undefined;
user.resetPasswordExpire = undefined;

await user.save();

return res.status(200).json({
    success: true,
    message: "Password reset successful",
});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};