const mongoose = require("mongoose")
const slugify = require("slugify")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const validator = require("validator")
const { restart } = require("nodemon")
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"]
    },
    email:{
        type:String,
        required:[true, "email is required"],
        validate:[validator.isEmail, "please enter valid email"],
        unique:true,
        lowercase:true,
    },
    photo:{
        type:String,
        default:"default.jpg"
    },
    role:{
        type:String,
        enum:["user",'admin','lead-guide','guide'],
        default:"user"
    },
    password:{
        type:String,
        required:[true,"password is required"],
        select:false,
        minlength:8
    },
    confirmPassword:{
        type:String,
        // required:[true, "password is required"],
        validate:{
            validator:function(val){
                return val===this.password
            },
            message:"passwords don't match"
        },
    },
    passwordChangedAt:{
        type:Date
    },
    passwordResetToken:String,
    resetTokenExpiresIn:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})  

// MIDDLEWARES
userSchema.pre("save", async function(next){
    // if password is not modified then move to next middleware
    if(!this.isModified('password')) return next()
    
    // ELSE HASH THE PASSWORD
    this.password=await bcrypt.hash(this.password,12)
    this.confirmPassword=undefined
})
userSchema.pre("save", async function(next){
    // if password is not modified then move to next middleware
    if(!this.isModified('password') || this.isNew) return next()
    this.passwordChangedAt=Date.now()
    next()
})

// USERSCHEME METHODS
userSchema.methods.correctPassword=function(candidatePassword,userPassword){
    return bcrypt.compare(candidatePassword,userPassword)
}
userSchema.methods.changedPassword = function(JWTTimeStamp){
    if (this.passwordChangedAt){
        return parseInt(this.passwordChangedAt.getTime()/1000,10)>JWTTimeStamp
    }
    console.log(this.passwordChangedAt,JWTTimeStamp)
    return false
}

userSchema.methods.createPasswordResetToken= function(){
    const resetToken = crypto.randomBytes(32).toString("hex")
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetTokenExpiresIn=Date.now() + 10 * 60 * 1000
    return resetToken
}

const userModel = mongoose.model("users",userSchema)
module.exports = userModel