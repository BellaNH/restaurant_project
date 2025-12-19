import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Name is required"],
        trim:true,
        minlength:[2, "Name must be at least 2 characters"],
        maxlength:[50, "Name cannot exceed 50 characters"]
    },
    email:{
        type:String,
        required:[true, "Email is required"],
        unique:true,
        lowercase:true,
        trim:true,
        match:[/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },
    password:{
        type:String,
        required:[true, "Password is required"],
        minlength:[8, "Password must be at least 8 characters"]
    },
    // Store hashes of recent passwords to prevent reuse (optional)
    passwordHistory: {
        type: [String],
        default: [],
        select: false
    },
    cartData:{
        type:Object,
        default:{}
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    verifyOtp: { 
        type: String, 
        default: "",
        select: false // Don't return OTP in queries by default
    },
    verifyOtpExpireAt: { 
        type: Number, 
        default: 0 
    },
    isAccountVerified: { 
        type: Boolean, 
        default: false 
    },
    // OTP for password reset
    resetOtp: { 
        type: String, 
        default: "",
        select: false // Don't return OTP in queries by default
    },
    resetOtpExpireAt: { 
        type: Number, 
        default: 0 
    },
    // Security counters and lock state
    verifyOtpAttempts: {
        type: Number,
        default: 0
    },
    resetOtpAttempts: {
        type: Number,
        default: 0
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Number,
        default: 0
    }
},{
    minimize:false,
    timestamps:true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
userSchema.index({ email: 1 }); // Index on email (already unique, but explicit index helps)
userSchema.index({ isAccountVerified: 1 }); // Index for filtering verified users
userSchema.index({ isAdmin: 1 }); // Index for admin queries

// Prevent password and OTPs from being returned in queries
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.verifyOtp;
    delete obj.resetOtp;
    return obj;
};

const userModel = mongoose.models.user || mongoose.model("user",userSchema)
export default userModel;