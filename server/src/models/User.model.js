import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema({
    fullName : {
        type : String,
        required : true,
        trim : true,
        unique : true
    },
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
    },
    avatar : {
        type : String,
        required : true,
    },
    coverImage : {
        type : String
    },
    password : {
        type : String,
        required : [true, "Password is required"]
    },
}, {timestamps : true});

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10);
    next()
});

UserSchema.methods.isPasswordCorrect = async function(password){
    return bcrypt.compare(password , this.password);
};

UserSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id : this._id,
        username : this.username,
        email : this.email,
        fullName : this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
)};



export const User = mongoose.models.User || mongoose.model("User", UserSchema)
