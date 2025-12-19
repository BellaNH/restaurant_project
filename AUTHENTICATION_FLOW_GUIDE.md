# Authentication Flow Guide - OTP-Based System

This document explains how OTP-based authentication systems work on popular platforms (like GitHub, Google, AWS, etc.) and details the complete flow for sign-up, email verification, login, and password reset.

---

## 📋 Table of Contents

1. [Sign Up Flow](#1-sign-up-flow)
2. [Email Verification Flow](#2-email-verification-flow)
3. [Login Flow](#3-login-flow)
4. [Password Reset Flow](#4-password-reset-flow)
5. [Security Best Practices](#5-security-best-practices)
6. [Common Patterns](#6-common-patterns)

---

## 1. Sign Up Flow

### Step-by-Step Process

```
User Action → Frontend → Backend → Database → Email Service → User
```

### Detailed Flow:

#### **Step 1: User Initiates Sign Up**
- User clicks "Sign Up" button
- User is presented with a registration form

#### **Step 2: User Fills Registration Form**
- **Required Fields:**
  - Username (or name)
  - Email address
  - Password
  - Confirm Password (optional but recommended)

#### **Step 3: Frontend Validation**
- Client-side validation checks:
  - Email format is valid
  - Password meets requirements (min length, complexity)
  - Username is available (optional real-time check)
  - Passwords match

#### **Step 4: Frontend Sends Request to Backend**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### **Step 5: Backend Processing**

**5.1 Input Validation & Sanitization**
- Validate all fields
- Sanitize inputs (trim whitespace, lowercase email)
- Check password strength

**5.2 Check if User Already Exists**
```javascript
const existingUser = await User.findOne({ email });
if (existingUser) {
  return error: "User already exists"
}
```

**5.3 Hash Password**
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
// Never store plain text passwords!
```

**5.4 Generate OTP**
```javascript
const otp = Math.floor(100000 + Math.random() * 900000).toString();
// 6-digit OTP (100000-999999)
```

**5.5 Set OTP Expiration**
```javascript
const otpExpireAt = Date.now() + (15 * 60 * 1000); // 15 minutes
```

**5.6 Create User Account (Unverified)**
```javascript
const user = new User({
  name,
  email,
  password: hashedPassword,
  verifyOtp: otp,
  verifyOtpExpireAt: otpExpireAt,
  isAccountVerified: false  // Account is NOT verified yet
});
await user.save();
```

#### **Step 6: Send OTP Email**
```javascript
const mailOptions = {
  from: "noreply@yourapp.com",
  to: email,
  subject: "Verify Your Email Address",
  html: `Your verification code is: ${otp}. It expires in 15 minutes.`
};

await transporter.sendMail(mailOptions);
```

**Email Content Example:**
```
Subject: Verify Your Email Address

Hello John Doe,

Thank you for signing up!

Your verification code is: 123456

This code will expire in 15 minutes.

If you didn't create this account, please ignore this email.
```

#### **Step 7: Backend Response**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email for verification OTP.",
  "userId": "507f1f77bcf86cd799439011"
}
```

#### **Step 8: Frontend Redirects User**
- User is redirected to email verification page
- User cannot log in until email is verified
- User sees message: "Please check your email for verification code"

---

## 2. Email Verification Flow

### Step-by-Step Process

#### **Step 1: User Receives Email**
- User checks their inbox
- Finds email with 6-digit OTP code

#### **Step 2: User Enters OTP**
- User navigates to verification page (or stays on same page)
- User enters the 6-digit OTP code

#### **Step 3: Frontend Sends Verification Request**
```http
POST /api/auth/verify-account
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "otp": "123456"
}
```

#### **Step 4: Backend Validates OTP**

**4.1 Find User**
```javascript
const user = await User.findById(userId);
if (!user) {
  return error: "User not found"
}
```

**4.2 Check if Already Verified**
```javascript
if (user.isAccountVerified) {
  return error: "Account already verified"
}
```

**4.3 Validate OTP**
```javascript
// Check if OTP matches
if (user.verifyOtp !== otp) {
  return error: "Invalid OTP"
}

// Check if OTP expired
if (user.verifyOtpExpireAt < Date.now()) {
  return error: "OTP Expired"
}
```

**4.4 Verify Account**
```javascript
user.isAccountVerified = true;
user.verifyOtp = "";  // Clear OTP after use
user.verifyOtpExpireAt = 0;
await user.save();
```

#### **Step 5: Backend Response**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### **Step 6: Frontend Updates UI**
- Show success message
- Redirect user to login page
- User can now log in

### **Resend OTP Flow**

If user doesn't receive OTP or it expires:

#### **Step 1: User Clicks "Resend OTP"**
```http
POST /api/auth/send-verify-otp
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011"
}
```

#### **Step 2: Backend Generates New OTP**
```javascript
const otp = Math.floor(100000 + Math.random() * 900000).toString();
user.verifyOtp = otp;
user.verifyOtpExpireAt = Date.now() + (15 * 60 * 1000);
await user.save();
```

#### **Step 3: Send New OTP Email**
- Same email sending process as registration

---

## 3. Login Flow

### Step-by-Step Process

#### **Step 1: User Initiates Login**
- User navigates to login page
- User enters email and password

#### **Step 2: Frontend Sends Login Request**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### **Step 3: Backend Validates Credentials**

**3.1 Find User**
```javascript
const user = await User.findOne({ email });
if (!user) {
  return error: "User not found"
}
```

**3.2 Check Email Verification Status** ⚠️ **CRITICAL**
```javascript
if (!user.isAccountVerified) {
  return error: "Please verify your email before logging in"
}
// This prevents unverified users from accessing the system
```

**3.3 Verify Password**
```javascript
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) {
  return error: "Invalid password"
}
```

#### **Step 4: Generate JWT Token**
```javascript
const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
```

#### **Step 5: Set HTTP-Only Cookie**
```javascript
res.cookie("token", token, {
  httpOnly: true,  // Prevents JavaScript access (XSS protection)
  secure: true,    // HTTPS only in production
  sameSite: "strict", // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

#### **Step 6: Backend Response**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **Step 7: Frontend Stores Token**
- Store token in localStorage (for manual API calls)
- Cookie is automatically sent with requests
- Redirect user to dashboard/home

#### **Step 8: Subsequent Requests**
- Frontend includes token in Authorization header:
```http
GET /api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4. Password Reset Flow

### Step-by-Step Process

#### **Step 1: User Clicks "Forgot Password"**
- User navigates to password reset page
- User enters their email address

#### **Step 2: Frontend Sends Reset Request**
```http
POST /api/auth/send-reset-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### **Step 3: Backend Processing**

**3.1 Find User**
```javascript
const user = await User.findOne({ email });
if (!user) {
  // For security, don't reveal if email exists
  return success: true, message: "If email exists, OTP sent"
}
```

**3.2 Generate Reset OTP**
```javascript
const otp = Math.floor(100000 + Math.random() * 900000).toString();
user.resetOtp = otp;
user.resetOtpExpireAt = Date.now() + (15 * 60 * 1000); // 15 minutes
await user.save();
```

**3.3 Send Reset OTP Email**
```javascript
const mailOptions = {
  from: "noreply@yourapp.com",
  to: email,
  subject: "Password Reset Request",
  html: `Your password reset code is: ${otp}. It expires in 15 minutes.`
};

await transporter.sendMail(mailOptions);
```

**Email Content Example:**
```
Subject: Password Reset Request

Hello John Doe,

You requested to reset your password.

Your reset code is: 654321

This code will expire in 15 minutes.

If you didn't request this, please ignore this email and your password will remain unchanged.
```

#### **Step 4: Backend Response**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

#### **Step 5: User Enters OTP and New Password**
- User receives email with OTP
- User enters OTP and new password on reset page

#### **Step 6: Frontend Sends Reset Password Request**
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "654321",
  "newPassword": "NewSecurePass456!"
}
```

#### **Step 7: Backend Validates and Resets**

**7.1 Find User**
```javascript
const user = await User.findOne({ email });
if (!user) {
  return error: "User not found"
}
```

**7.2 Validate OTP**
```javascript
if (user.resetOtp !== otp) {
  return error: "Invalid OTP"
}

if (user.resetOtpExpireAt < Date.now()) {
  return error: "OTP Expired"
}
```

**7.3 Hash New Password**
```javascript
const hashedPassword = await bcrypt.hash(newPassword, 10);
```

**7.4 Update Password**
```javascript
user.password = hashedPassword;
user.resetOtp = "";  // Clear OTP after use
user.resetOtpExpireAt = 0;
await user.save();
```

#### **Step 8: Backend Response**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

#### **Step 9: Frontend Redirects**
- Show success message
- Redirect to login page
- User can now log in with new password

---

## 5. Security Best Practices

### ✅ Implemented in This System

1. **Password Hashing**
   - Passwords are hashed using bcrypt (10 rounds)
   - Never store plain text passwords

2. **OTP Expiration**
   - OTPs expire after 15 minutes
   - Prevents reuse of old OTPs

3. **Email Verification Required**
   - Users cannot log in until email is verified
   - Prevents fake/spam accounts

4. **HTTP-Only Cookies**
   - Tokens stored in httpOnly cookies
   - Prevents XSS attacks

5. **OTP Single Use**
   - OTPs are cleared after successful verification
   - Prevents replay attacks

6. **Secure Token Storage**
   - JWT tokens with expiration (7 days)
   - Secure flag in production

### 🔄 Recommended Enhancements

1. **Rate Limiting**
   ```javascript
   // Limit OTP requests to prevent abuse
   // Example: Max 3 OTP requests per hour per email
   ```

2. **Account Lockout**
   ```javascript
   // Lock account after 5 failed login attempts
   // Unlock after 30 minutes or email verification
   ```

3. **Password Strength Requirements**
   ```javascript
   // Enforce: min 8 chars, uppercase, lowercase, number, special char
   ```

4. **Token Refresh Mechanism**
   ```javascript
   // Use refresh tokens for better security
   // Short-lived access tokens (15 min) + refresh tokens (7 days)
   ```

5. **IP-Based Rate Limiting**
   ```javascript
   // Track OTP requests by IP address
   // Prevent brute force attacks
   ```

6. **Email Domain Validation**
   ```javascript
   // Block disposable email domains
   // Validate email deliverability
   ```

7. **OTP Attempt Limits**
   ```javascript
   // Max 3 OTP verification attempts
   // Require new OTP after failed attempts
   ```

---

## 6. Common Patterns

### Pattern 1: Security Through Obscurity (Don't Reveal User Existence)

**Good Practice:**
```javascript
// Don't reveal if email exists during password reset
if (!user) {
  return res.status(200).json({ 
    success: true, 
    message: "If email exists, OTP sent" 
  });
}
```

**Why:** Prevents attackers from discovering valid email addresses

### Pattern 2: Asynchronous Email Sending

**Good Practice:**
```javascript
// Don't wait for email to send before responding
transporter.sendMail(mailOptions).catch((error) => {
  console.error("Email error:", error);
});

// Respond immediately
return res.status(201).json({ success: true });
```

**Why:** Faster response times, better user experience

### Pattern 3: OTP Storage Security

**Good Practice:**
```javascript
// Don't return OTPs in queries
verifyOtp: { 
  type: String, 
  select: false  // Hidden by default
}
```

**Why:** Prevents accidental OTP exposure in API responses

### Pattern 4: Database Timeouts

**Good Practice:**
```javascript
const user = await User.findOne({ email }).maxTimeMS(5000);
```

**Why:** Prevents hanging requests if database is slow

### Pattern 5: Input Validation Layers

**Multi-layer validation:**
1. Frontend validation (immediate feedback)
2. Backend schema validation (Joi/Zod)
3. Database constraints (MongoDB schema)

**Why:** Defense in depth, prevents invalid data

---

## 📊 Flow Diagrams

### Sign Up Flow
```
User → Fill Form → Submit → Backend Validates → Create Account (Unverified)
                                                      ↓
                                              Generate OTP
                                                      ↓
                                              Send Email
                                                      ↓
                                              Return Success
                                                      ↓
                                              User Enters OTP
                                                      ↓
                                              Verify Account
                                                      ↓
                                              Account Verified ✅
```

### Password Reset Flow
```
User → Forgot Password → Enter Email → Backend Finds User
                                                    ↓
                                            Generate Reset OTP
                                                    ↓
                                            Send Email
                                                    ↓
                                            User Enters OTP + New Password
                                                    ↓
                                            Validate OTP
                                                    ↓
                                            Update Password
                                                    ↓
                                            Password Reset ✅
```

---

## 🔐 Security Checklist

- [x] Passwords are hashed (bcrypt)
- [x] OTPs expire after 15 minutes
- [x] Email verification required for login
- [x] HTTP-only cookies for tokens
- [x] OTPs cleared after use
- [x] Input validation and sanitization
- [x] Database timeouts
- [ ] Rate limiting (recommended)
- [ ] Account lockout (recommended)
- [ ] Password strength enforcement (recommended)
- [ ] Token refresh mechanism (recommended)
- [ ] IP-based rate limiting (recommended)

---

## 📝 Notes

- **OTP Length:** 6 digits is standard (100000-999999)
- **OTP Expiry:** 15 minutes is common, but can be adjusted
- **Token Expiry:** 7 days is reasonable, but consider shorter for sensitive apps
- **Email Delivery:** Use reliable email service (SendGrid, AWS SES, etc.)
- **Error Messages:** Keep them generic to prevent information leakage

---

## 🚀 Implementation Status

Your current implementation includes:
- ✅ Sign up with OTP
- ✅ Email verification
- ✅ Login with email verification check
- ✅ Password reset with OTP
- ✅ Secure password hashing
- ✅ JWT token authentication
- ✅ HTTP-only cookies

This matches the authentication patterns used by major platforms like GitHub, Google, AWS, and others!





