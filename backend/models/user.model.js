import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        
    },
    email:{
        type:String,
        required:true,
        unique:true,

    },
    password:{
        type:String,
        required:true,
    },
    globalRole:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    avatar:{
        url:{
            type:String,
            default:""
        },
        public_id:{
            type:String,
            default:""
        }
    },
    resetPasswordToken:{
        type:String,
    },
    resetPasswordExpire:{
        type: Date,
    }
},{
    timestamps:true
})

export default mongoose.model("User",userSchema)