import jwt from "jsonwebtoken";
import userModel from "../models/usermodel.js";

// Middleware to verify user is authenticated
const authUser = async (req, res, next) => {
  try {
    // Prefer Authorization header, but also support httpOnly cookies
    const authHeader = req.headers.authorization;
    let token =
      authHeader && authHeader.startsWith("Bearer ") 
        ? authHeader.split(" ")[1] 
        : null;

    if (!token && req.cookies) {
      // New access token cookie
      token = req.cookies.accessToken || req.cookies.token || null;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access not authorized. Token required.",
      });
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to verify user exists
    const user = await userModel.findById(decodedToken.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found",
      });
    }

    // Attach user info to request
    req.body.userId = decodedToken.id;
    req.user = {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired",
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: "Authentication error", 
      error: error.message,
    });
  }
};

export default authUser;
