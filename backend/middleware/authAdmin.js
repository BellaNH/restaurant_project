import jwt from "jsonwebtoken";
import userModel from "../models/usermodel.js";

// Middleware to verify user is authenticated AND is an admin
const authAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header or httpOnly cookies
    const authHeader = req.headers.authorization;
    let token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token && req.cookies) {
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

    // Get user from database to check admin status
    const user = await userModel.findById(decodedToken.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
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

export default authAdmin;



