import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/usermodel.js";
import transporter from "../config/nodemailer.js";
import sessionModel from "../models/sessionmodel.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";
import {
  REGISTER_OTP_EXPIRY,
  VERIFY_OTP_EXPIRY,
  RESET_OTP_EXPIRY,
  MAX_VERIFY_OTP_ATTEMPTS,
  MAX_RESET_OTP_ATTEMPTS,
  MAX_LOGIN_ATTEMPTS,
  ACCOUNT_LOCK_TIME,
  REFRESH_TOKEN_DAYS,
} from "../config/constants.js";

const createAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_DAYS}d`,
  });
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};

// Test endpoint to verify email configuration
export const testEmail = async (req, res) => {
  try {
    const { testEmail } = req.body;
    const recipientEmail = testEmail || process.env.SMTP_USER;

    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        message: "No email address provided. Use testEmail in request body or set SMTP_USER in .env",
      });
    }

    console.log("[TEST EMAIL] Starting email test...");
    console.log("[TEST EMAIL] SMTP_USER:", process.env.SMTP_USER || "NOT SET");
    console.log("[TEST EMAIL] SMTP_PASS:", process.env.SMTP_PASS ? `SET (length: ${process.env.SMTP_PASS.length})` : "NOT SET");
    console.log("[TEST EMAIL] SENDER_EMAIL:", process.env.SENDER_EMAIL || "NOT SET");
    console.log("[TEST EMAIL] Sending test email to:", recipientEmail);

    const mailOptions = {
      from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to: recipientEmail,
      subject: "Test Email - Restaurant App",
      text: "This is a test email from your Restaurant App. If you received this, your email configuration is working correctly!",
      html: "<p>This is a <strong>test email</strong> from your Restaurant App.</p><p>If you received this, your email configuration is working correctly!</p>",
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("[TEST EMAIL] Email sent successfully!");
    console.log("[TEST EMAIL] Message ID:", result.messageId);
    console.log("[TEST EMAIL] Response:", result.response);

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully! Check your inbox.",
      messageId: result.messageId,
      to: recipientEmail,
    });
  } catch (error) {
    console.error("[TEST EMAIL] ========== EMAIL TEST FAILED ==========");
    console.error("[TEST EMAIL] Error code:", error.code || "NO_CODE");
    console.error("[TEST EMAIL] Error message:", error.message || "NO_MESSAGE");
    console.error("[TEST EMAIL] Full error:", JSON.stringify(error, null, 2));

    let errorMessage = "Failed to send test email";
    let suggestions = [];

    if (error.code === "EAUTH") {
      errorMessage = "Gmail authentication failed";
      suggestions = [
        "Make sure you're using an App Password, not your regular Gmail password",
        "Enable 2-Step Verification on your Google Account",
        "Generate a new App Password at: https://myaccount.google.com/apppasswords",
        "Verify SMTP_USER is your full email address (e.g., yourname@gmail.com)",
        "Verify SMTP_PASS is the 16-character App Password (no spaces)",
      ];
    } else if (error.code === "ECONNECTION") {
      errorMessage = "Cannot connect to Gmail SMTP server";
      suggestions = [
        "Check your internet connection",
        "Verify firewall isn't blocking SMTP connections",
        "Try again in a few minutes",
      ];
    } else if (error.code === "ETIMEDOUT") {
      errorMessage = "Connection to Gmail timed out";
      suggestions = [
        "Check your internet connection",
        "Gmail servers might be temporarily unavailable",
        "Try again in a few minutes",
      ];
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      code: error.code,
      suggestions,
    });
  }
};

export const register = async (req, res) => {
  // Input is already validated and sanitized by middleware
  const { name, email, password } = req.body;
  
  const startTime = Date.now();
  console.log(`[REGISTER] Starting registration for: ${email} at ${new Date().toISOString()}`);

  try {
    // Check if user exists with timeout
    const checkStart = Date.now();
    const existingUser = await userModel.findOne({ email }).maxTimeMS(5000);
    console.log(`[REGISTER] User existence check took: ${Date.now() - checkStart}ms`);

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    const hashStart = Date.now();
    const hashedPassword = await bycrypt.hash(password, 10);
    console.log(`[REGISTER] Password hash took: ${Date.now() - hashStart}ms`);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHashStart = Date.now();
    const hashedOtp = await bycrypt.hash(otp, 10);
    console.log(`[REGISTER] OTP hash took: ${Date.now() - otpHashStart}ms`);
    const otpExpire = Date.now() + REGISTER_OTP_EXPIRY; 

    const user = new userModel({ 
      name, 
      email, 
      password: hashedPassword,
      passwordHistory: [hashedPassword],
      verifyOtp: hashedOtp,
      verifyOtpExpireAt: otpExpire,
      isAccountVerified: false
    });
    
    const saveStart = Date.now();
    await user.save();
    console.log(`[REGISTER] User save took: ${Date.now() - saveStart}ms`);
    console.log(`[REGISTER] User saved successfully: ${user._id} at ${new Date().toISOString()}`);
    console.log(`[REGISTER] Total time before response: ${Date.now() - startTime}ms`);

    // CRITICAL: Send response IMMEDIATELY after user.save() succeeds
    // Do NOT do ANY other work before sending response
    const responseStartTime = Date.now();
    console.log(`[REGISTER] Sending response immediately for user: ${user._id}`);
    
    const responsePayload = { 
      success: true,
      message: "Account created successfully. Please check your email for verification OTP.",
      userId: user._id 
    };
    
    // Send response and immediately return - do NOT await anything after this
    res.status(201).json(responsePayload);
    
    const responseTime = Date.now() - responseStartTime;
    console.log(`[REGISTER] Response sent in ${responseTime}ms for user: ${user._id}, headersSent: ${res.headersSent}`);
    
    // CRITICAL: Return immediately after sending response
    // All email work happens in background and cannot block the response
    if (res.headersSent) {
      // Schedule email sending for next event loop tick (truly non-blocking)
      setImmediate(() => {
        try {
          const mailOptions = {
            from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
            to: email,
            subject: "Welcome to Restaurant",
            text: `Your OTP is ${otp}. It expires 15 minutes later`
          };

          console.log(`[REGISTER] Background: ========== EMAIL SENDING STARTED ==========`);
          console.log(`[REGISTER] Background: Timestamp: ${new Date().toISOString()}`);
          console.log(`[REGISTER] Background: User ID: ${user._id}`);
          console.log(`[REGISTER] Background: User email: ${email}`);
          console.log(`[REGISTER] Background: OTP to send: ${otp}`);
          console.log(`[REGISTER] Background: Attempting to send email for user: ${user._id}`);
          console.log(`[REGISTER] Background: Email config - From: ${mailOptions.from}`);
          console.log(`[REGISTER] Background: Email config - To: ${mailOptions.to}`);
          console.log(`[REGISTER] Background: Email config - Subject: ${mailOptions.subject}`);
          console.log(`[REGISTER] Background: SMTP_USER: ${process.env.SMTP_USER ? "SET" : "NOT SET"}`);
          console.log(`[REGISTER] Background: SMTP_PASS: ${process.env.SMTP_PASS ? `SET (length: ${process.env.SMTP_PASS.length})` : "NOT SET"}`);
          console.log(`[REGISTER] Background: SENDER_EMAIL: ${process.env.SENDER_EMAIL || "NOT SET (using SMTP_USER)"}`);
          
          const emailStartTime = Date.now();
          
          // Add timeout to email sending to prevent hanging indefinitely (increased to 60s for slow Gmail)
          const emailPromise = transporter.sendMail(mailOptions);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Email sending timeout after 60 seconds")), 60000)
          );
          
          Promise.race([emailPromise, timeoutPromise])
            .then((result) => {
              const emailTime = Date.now() - emailStartTime;
              console.log(`[REGISTER] Background: ========== EMAIL SENT SUCCESSFULLY ==========`);
              console.log(`[REGISTER] Background: Email sent in ${emailTime}ms`);
              console.log(`[REGISTER] Background: User ID: ${user._id}`);
              console.log(`[REGISTER] Background: Email sent to: ${email}`);
              console.log(`[REGISTER] Background: Message ID: ${result.messageId || "No message ID"}`);
              console.log(`[REGISTER] Background: Email response: ${result.response || "No response"}`);
              console.log(`[REGISTER] Background: OTP sent: ${otp}`);
              console.log(`[REGISTER] Background: ==========================================`);
            })
            .catch((emailError) => {
              const emailTime = Date.now() - emailStartTime;
              console.error(`[REGISTER] Background: ========== EMAIL SENDING FAILED AFTER ${emailTime}ms ==========`);
              console.error(`[REGISTER] Background: User ID: ${user._id}`);
              console.error(`[REGISTER] Background: Email attempted: ${email}`);
              console.error(`[REGISTER] Background: OTP that should have been sent: ${otp}`);
              console.error(`[REGISTER] Background: Error name: ${emailError.name || "NO_NAME"}`);
              console.error(`[REGISTER] Background: Error code: ${emailError.code || "NO_CODE"}`);
              console.error(`[REGISTER] Background: Error message: ${emailError.message || "NO_MESSAGE"}`);
              console.error(`[REGISTER] Background: Error command: ${emailError.command || "NO_COMMAND"}`);
              console.error(`[REGISTER] Background: Full error object:`, emailError);
              
              // Common Gmail errors with detailed guidance
              if (emailError.code === "EAUTH") {
                console.error(`[REGISTER] Background: ========== GMAIL AUTHENTICATION ERROR ==========`);
                console.error(`[REGISTER] Background: Gmail rejected the login credentials`);
                console.error(`[REGISTER] Background: SOLUTION: Use an App Password, not your regular Gmail password`);
                console.error(`[REGISTER] Background: Steps:`);
                console.error(`[REGISTER] Background: 1. Enable 2-Step Verification on your Google Account`);
                console.error(`[REGISTER] Background: 2. Generate an App Password at: https://myaccount.google.com/apppasswords`);
                console.error(`[REGISTER] Background: 3. Use the 16-character App Password in SMTP_PASS`);
                console.error(`[REGISTER] Background: 4. Make sure SMTP_USER is your full email address`);
                console.error(`[REGISTER] Background: ================================================`);
              } else if (emailError.code === "ECONNECTION") {
                console.error(`[REGISTER] Background: ========== GMAIL CONNECTION ERROR ==========`);
                console.error(`[REGISTER] Background: Cannot connect to Gmail SMTP server`);
                console.error(`[REGISTER] Background: Possible causes:`);
                console.error(`[REGISTER] Background: - Internet connection issue`);
                console.error(`[REGISTER] Background: - Firewall blocking SMTP connections`);
                console.error(`[REGISTER] Background: - Gmail servers temporarily unavailable`);
                console.error(`[REGISTER] Background: ==========================================`);
              } else if (emailError.message && emailError.message.includes("timeout")) {
                console.error(`[REGISTER] Background: ========== EMAIL SENDING TIMEOUT ==========`);
                console.error(`[REGISTER] Background: Email sending took longer than 60 seconds`);
                console.error(`[REGISTER] Background: Gmail SMTP is very slow or unresponsive`);
                console.error(`[REGISTER] Background: Consider using a different email service for production`);
                console.error(`[REGISTER] Background: ==========================================`);
              } else {
                console.error(`[REGISTER] Background: ========== UNKNOWN EMAIL ERROR ==========`);
                console.error(`[REGISTER] Background: Unexpected error occurred during email sending`);
                console.error(`[REGISTER] Background: Check error details above for more information`);
                console.error(`[REGISTER] Background: ==========================================`);
              }
              console.error(`[REGISTER] Background: ==========================================`);
            });
        } catch (emailSetupError) {
          console.error(`[REGISTER] Background: Error setting up email for user ${user._id}:`, emailSetupError.message || emailSetupError);
        }
      });
    } else {
      console.error(`[REGISTER] CRITICAL ERROR: Response headers NOT sent for user: ${user._id}`);
    }
    
    // Return immediately - response is already sent
    return;
  } catch (error) {
    // Ensure we always send a response
    if (res.headersSent) {
      console.error("Response already sent, but error occurred:", error);
      return;
    }

    // Handle database errors
    if (error.name === 'MongoServerError' || error.message.includes('timeout')) {
      return res.status(500).json({ 
        success: false, 
        message: "Database error. Please try again." 
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: error.message || "Validation error" 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: error.message || "Registration failed. Please try again." 
    });
  }
};

export const login = async (req, res) => {
  // Input is already validated and sanitized by middleware
  const { email, password } = req.body;

  try {
    // Use lean() for faster query and add timeout
    const user = await userModel.findOne({ email }).lean().maxTimeMS(5000);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "This user doesn't exist." 
      });
    }

    // Check if email is verified
    if (!user.isAccountVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your email before logging in. Check your inbox for the verification OTP." 
      });
    }

    // Get full user document to access password (lean() doesn't include password by default due to select: false)
    const userWithPassword = await userModel.findOne({ email }).maxTimeMS(5000);
    
    if (!userWithPassword) {
      return res.status(404).json({ 
        success: false, 
        message: "This user doesn't exist." 
      });
    }

    // Check if account is locked due to repeated failed attempts
    if (userWithPassword.lockUntil && userWithPassword.lockUntil > Date.now()) {
      const remainingMs = userWithPassword.lockUntil - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      return res.status(423).json({
        success: false,
        message: `Account is locked due to multiple failed login attempts. Try again in ${remainingMinutes} minute(s).`,
      });
    }

    const isMatch = await bycrypt.compare(password, userWithPassword.password);

    if (!isMatch) {
      // Increment failed login attempts and lock account if threshold reached
      const currentAttempts = userWithPassword.failedLoginAttempts || 0;
      const newAttempts = currentAttempts + 1;
      userWithPassword.failedLoginAttempts = newAttempts;

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        userWithPassword.lockUntil = Date.now() + ACCOUNT_LOCK_TIME;
        userWithPassword.failedLoginAttempts = 0; // reset counter after locking
      }

      await userWithPassword.save();

      return res.status(401).json({ 
        success: false, 
        message: "Invalid Password" 
      });
    }

    // Successful login - clear failed attempts and lock
    userWithPassword.failedLoginAttempts = 0;
    userWithPassword.lockUntil = 0;
    await userWithPassword.save();

    // Create a session and issue tokens
    const sessionExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
    );

    const session = await sessionModel.create({
      userId: userWithPassword._id,
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || req.headers["x-forwarded-for"] || "",
      expiresAt: sessionExpiresAt,
    });

    const accessToken = createAccessToken(userWithPassword._id);
    const refreshToken = createRefreshToken(session._id);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "user logged in successfully",
    });
  } catch (error) {
    // Handle timeout errors
    if (error.name === 'MongoServerError' || error.message.includes('timeout')) {
      return res.status(500).json({ 
        success: false, 
        message: "Database connection timeout. Please try again." 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Login failed. Please try again." 
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
        if (decoded.sessionId) {
          await sessionModel.findByIdAndUpdate(decoded.sessionId, {
            revoked: true,
            revokedAt: new Date(),
            revokedReason: "User logout",
          });
        }
      } catch (e) {
        // If refresh token is invalid/expired, just proceed to clear cookies
      }
    }

    clearAuthCookies(res);

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const logoutAll = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated.",
      });
    }

    await sessionModel.updateMany(
      { userId, revoked: false },
      {
        revoked: true,
        revokedAt: new Date(),
        revokedReason: "Logout from all devices",
      }
    );

    clearAuthCookies(res);

    return res.json({
      success: true,
      message: "Logged out from all devices.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to logout from all devices.",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshTokenCookie = req.cookies?.refreshToken;

    if (!refreshTokenCookie) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        refreshTokenCookie,
        process.env.JWT_REFRESH_SECRET
      );
    } catch (error) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }

    const session = await sessionModel.findById(decoded.sessionId);

    if (
      !session ||
      session.revoked ||
      !session.expiresAt ||
      session.expiresAt.getTime() < Date.now()
    ) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Session is no longer valid.",
      });
    }

    const user = await userModel.findById(session.userId);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    const newAccessToken = createAccessToken(user._id);
    // Keep existing refresh token & session (no rotation for now)
    setAuthCookies(res, newAccessToken, refreshTokenCookie);

    return res.json({
      success: true,
      message: "Access token refreshed.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to refresh token.",
    });
  }
};


export const sendVerifyOtp = async (req, res) => {
  const startTime = Date.now();
  console.log(`[SEND_VERIFY_OTP] ========== REQUEST RECEIVED ==========`);
  console.log(`[SEND_VERIFY_OTP] Timestamp: ${new Date().toISOString()}`);
  console.log(`[SEND_VERIFY_OTP] Request body:`, JSON.stringify(req.body, null, 2));
  console.log(`[SEND_VERIFY_OTP] Request headers:`, {
    'content-type': req.headers['content-type'],
    'origin': req.headers.origin,
    'user-agent': req.headers['user-agent']
  });

  try {
    const { userId } = req.body;

    // Validate userId exists
    if (!userId) {
      console.error(`[SEND_VERIFY_OTP] ERROR: userId is missing from request body`);
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required",
        error: "Missing userId in request body",
        receivedBody: req.body
      });
    }

    console.log(`[SEND_VERIFY_OTP] Looking up user with ID: ${userId}`);
    const user = await userModel.findById(userId).select("+verifyOtp");

    if (!user) {
      console.error(`[SEND_VERIFY_OTP] ERROR: User not found with ID: ${userId}`);
      return res.status(404).json({ 
        success: false, 
        message: "User not found",
        error: `No user found with ID: ${userId}`,
        userId: userId
      });
    }

    console.log(`[SEND_VERIFY_OTP] User found: ${user.email} (ID: ${user._id})`);

    if (user.isAccountVerified) {
      console.log(`[SEND_VERIFY_OTP] WARNING: Account already verified for user: ${user._id}`);
      return res.status(400).json({ 
        success: false, 
        message: "Account already verified",
        error: "This account has already been verified"
      });
    }

    console.log(`[SEND_VERIFY_OTP] Generating new OTP for user: ${user._id}`);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    console.log(`[SEND_VERIFY_OTP] Generated OTP: ${otp} (will be hashed)`);
    
    const hashStart = Date.now();
    const hashedOtp = await bycrypt.hash(otp, 10);
    console.log(`[SEND_VERIFY_OTP] OTP hashed in ${Date.now() - hashStart}ms`);

    user.verifyOtp = hashedOtp;
    user.verifyOtpExpireAt = Date.now() + VERIFY_OTP_EXPIRY;
    user.verifyOtpAttempts = 0; // reset attempts on new OTP

    const saveStart = Date.now();
    await user.save();
    console.log(`[SEND_VERIFY_OTP] User saved in ${Date.now() - saveStart}ms`);

    const mailOptions = {
      from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    console.log(`[SEND_VERIFY_OTP] Preparing to send email:`);
    console.log(`[SEND_VERIFY_OTP] From: ${mailOptions.from}`);
    console.log(`[SEND_VERIFY_OTP] To: ${mailOptions.to}`);
    console.log(`[SEND_VERIFY_OTP] SMTP_USER: ${process.env.SMTP_USER ? "SET" : "NOT SET"}`);
    console.log(`[SEND_VERIFY_OTP] SMTP_PASS: ${process.env.SMTP_PASS ? `SET (length: ${process.env.SMTP_PASS.length})` : "NOT SET"}`);

    const emailStart = Date.now();
    const emailResult = await transporter.sendMail(mailOptions);
    console.log(`[SEND_VERIFY_OTP] Email sent successfully in ${Date.now() - emailStart}ms`);
    console.log(`[SEND_VERIFY_OTP] Email message ID: ${emailResult.messageId}`);
    console.log(`[SEND_VERIFY_OTP] Email response: ${emailResult.response || "No response"}`);

    const totalTime = Date.now() - startTime;
    console.log(`[SEND_VERIFY_OTP] Total request time: ${totalTime}ms`);
    console.log(`[SEND_VERIFY_OTP] ========== SUCCESS ==========`);

    return res.status(200).json({ 
      success: true, 
      message: "Verification OTP sent to your email",
      messageId: emailResult.messageId
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[SEND_VERIFY_OTP] ========== ERROR AFTER ${totalTime}ms ==========`);
    console.error(`[SEND_VERIFY_OTP] Error name: ${error.name || "NO_NAME"}`);
    console.error(`[SEND_VERIFY_OTP] Error message: ${error.message || "NO_MESSAGE"}`);
    console.error(`[SEND_VERIFY_OTP] Error code: ${error.code || "NO_CODE"}`);
    console.error(`[SEND_VERIFY_OTP] Error stack:`, error.stack || "NO_STACK");
    console.error(`[SEND_VERIFY_OTP] Full error:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    // Email-specific errors
    if (error.code === "EAUTH") {
      console.error(`[SEND_VERIFY_OTP] GMAIL AUTHENTICATION ERROR`);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send email: Authentication error. Please check SMTP configuration.",
        error: error.message,
        code: error.code,
        details: "Gmail authentication failed. Make sure you're using an App Password."
      });
    } else if (error.code === "ECONNECTION") {
      console.error(`[SEND_VERIFY_OTP] GMAIL CONNECTION ERROR`);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send email: Cannot connect to email server.",
        error: error.message,
        code: error.code
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to send verification OTP",
      error: error.message,
      code: error.code || "UNKNOWN_ERROR",
      details: "An unexpected error occurred while sending the verification email"
    });
  }
};


export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({
      success: false,
      message: "Missing details",
    });
  }

  try {
    const user = await userModel.findById(userId).select("+verifyOtp");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Too many invalid attempts
    if (user.verifyOtpAttempts >= MAX_VERIFY_OTP_ATTEMPTS) {
      return res.json({
        success: false,
        message: "Too many invalid OTP attempts. Please request a new verification code.",
      });
    }

    if (!user.verifyOtp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    const isOtpMatch = await bycrypt.compare(otp, user.verifyOtp);

    if (!isOtpMatch) {
      user.verifyOtpAttempts = (user.verifyOtpAttempts || 0) + 1;

      // If threshold reached, clear OTP so user must request a new one
      if (user.verifyOtpAttempts >= MAX_VERIFY_OTP_ATTEMPTS) {
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;
      }

      await user.save();

      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      user.verifyOtpAttempts = (user.verifyOtpAttempts || 0) + 1;

      if (user.verifyOtpAttempts >= MAX_VERIFY_OTP_ATTEMPTS) {
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;
      }

      await user.save();

      return res.json({ success: false, message: "OTP Expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    user.verifyOtpAttempts = 0;

    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

  
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    // Query database with explicit timeout to prevent hanging
    const user = await userModel.findOne({ email }).lean().maxTimeMS(5000);

    if (!user) {
      // Return immediately with 404 status - user doesn't exist
      return res.status(404).json({ 
        success: false, 
        message: "This user doesn't exist." 
      });
    }

    // User exists - generate OTP and save
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bycrypt.hash(otp, 10);

    // Update user with OTP (with timeout) and reset attempts
    await userModel.updateOne(
      { _id: user._id },
      {
        resetOtp: hashedOtp,
        resetOtpExpireAt: Date.now() + RESET_OTP_EXPIRY,
        resetOtpAttempts: 0,
      }
    ).maxTimeMS(5000);

    // Send email asynchronously (don't block the response)
    const mailOptions = {
      from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    // Send email but don't wait for it - respond immediately
    transporter.sendMail(mailOptions).catch((emailError) => {
      console.error("Email sending error (non-blocking):", emailError);
    });

    // Return success immediately
    return res.status(200).json({ 
      success: true, 
      message: "OTP sent to your email" 
    });
  } catch (error) {
    // Ensure we always send a response
    if (res.headersSent) {
      console.error("Response already sent, but error occurred:", error);
      return;
    }

    // Handle timeout errors specifically
    if (error.name === 'MongoServerError' || error.message.includes('timeout') || error.message.includes('maxTimeMS')) {
      return res.status(500).json({ 
        success: false, 
        message: "Database connection timeout. Please try again." 
      });
    }

    // Handle database connection errors
    if (error.name === 'MongooseError') {
      return res.status(500).json({ 
        success: false, 
        message: "Database error. Please try again." 
      });
    }

    // Handle other errors
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to send OTP. Please try again." 
    });
  }
};

// Reset User Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP, and New Password are required",
    });
  }

  try {
    const user = await userModel
      .findOne({ email })
      .select("+resetOtp +passwordHistory");

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    // Too many invalid reset attempts
    if (user.resetOtpAttempts >= MAX_RESET_OTP_ATTEMPTS) {
      return res.json({
        success: false,
        message: "Too many invalid OTP attempts. Please request a new reset code.",
      });
    }

    if (!user.resetOtp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    const isOtpMatch = await bycrypt.compare(otp, user.resetOtp);

    if (!isOtpMatch) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;

      if (user.resetOtpAttempts >= MAX_RESET_OTP_ATTEMPTS) {
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;
      }

      await user.save();

      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;

      if (user.resetOtpAttempts >= MAX_RESET_OTP_ATTEMPTS) {
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;
      }

      await user.save();

      return res.json({ success: false, message: "OTP Expired" });
    }

    // Prevent reuse of recent passwords (including current one)
    const history = Array.isArray(user.passwordHistory)
      ? user.passwordHistory
      : [];

    for (const oldHash of history) {
      const isReuse = await bycrypt.compare(newPassword, oldHash);
      if (isReuse) {
        return res.json({
          success: false,
          message:
            "New password cannot be the same as your recent passwords. Please choose a different password.",
        });
      }
    }

    // Also check current password
    const isCurrentReuse = await bycrypt.compare(newPassword, user.password);
    if (isCurrentReuse) {
      return res.json({
        success: false,
        message:
          "New password cannot be the same as your current password. Please choose a different password.",
      });
    }

    const hashedPassword = await bycrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    user.resetOtpAttempts = 0;
    user.passwordHistory = [hashedPassword, ...history].slice(0, 3);

    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
