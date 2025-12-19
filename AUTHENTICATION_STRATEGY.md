# Authentication & Token Storage Strategy

This document outlines the authentication and token storage strategy implemented in the restaurant project.

## Token Storage Approach

### Current Implementation

The application uses a **hybrid approach** for token storage:

1. **Backend (Primary)**: JWT tokens are stored in **httpOnly cookies**
   - More secure - not accessible via JavaScript (XSS protection)
   - Automatically sent with requests
   - Configured with secure flags in production

2. **Frontend (Secondary)**: JWT tokens are also stored in **localStorage**
   - Used for manual API calls where cookies might not be sent
   - Required for axios requests that need explicit Authorization headers

### Why This Approach?

- **httpOnly Cookies**: Provide better security against XSS attacks
- **localStorage**: Required because some API calls need explicit `Authorization: Bearer <token>` headers
- The backend sends tokens in both formats to support both methods

### Security Considerations

✅ **Implemented:**
- httpOnly cookies prevent JavaScript access (XSS protection)
- Secure flag enabled in production (HTTPS only)
- SameSite attribute prevents CSRF attacks
- Tokens expire after 7 days

⚠️ **Recommendations for Future:**
- Consider implementing token refresh mechanism
- Add rate limiting to authentication endpoints
- Implement token blacklisting for logout
- Consider using refresh tokens for better security

## Authentication Flow

### Registration Flow

1. User submits registration form
2. Backend creates user with `isAccountVerified: false`
3. OTP sent to user's email
4. User redirected to email verification page
5. User enters OTP to verify email
6. Account marked as verified (`isAccountVerified: true`)

### Login Flow

1. User submits login credentials
2. Backend verifies:
   - User exists
   - Password is correct
   - **Email is verified** (enforced)
3. JWT token generated and sent in:
   - httpOnly cookie
   - Response body (for localStorage storage)
4. Frontend stores token in localStorage
5. Token used for subsequent API calls

### Protected Routes

#### User Routes (Require Authentication)
- `/api/order/placeorder` - Place order
- `/api/order/verifyorder` - Verify order payment
- `/api/order/myorders` - Get user's orders
- `/api/user/role` - Get user role
- `/cart/*` - Cart operations

**Middleware**: `authUser` - Verifies token and user exists

#### Admin Routes (Require Admin Authentication)
- `/api/food/add` - Add food item
- `/api/food/edit` - Edit food item
- `/api/food/remove` - Remove food item
- `/api/food/fetchEditedFood` - Get food item for editing
- `/api/category/addCategory` - Add category
- `/api/category/editCategory` - Edit category
- `/api/category/removeCategory` - Remove category
- `/api/category/fetchEditedCateg` - Get category for editing
- `/api/order/allorders` - Get all orders
- `/api/order/status` - Update order status

**Middleware**: `authAdmin` - Verifies token, user exists, AND user is admin

## Middleware Details

### authUser Middleware

**Location**: `backend/middleware/authuser.js`

**Functionality:**
- Extracts token from `Authorization: Bearer <token>` header
- Verifies JWT token signature
- Checks if user exists in database
- Attaches user info to `req.user` and `req.body.userId`

**Error Handling:**
- Returns 401 for missing/invalid/expired tokens
- Returns 401 if user not found
- Returns 500 for server errors

### authAdmin Middleware

**Location**: `backend/middleware/authAdmin.js`

**Functionality:**
- Performs all checks from `authUser`
- Additionally verifies `user.isAdmin === true`
- Returns 403 if user is not admin

**Error Handling:**
- Returns 401 for authentication issues
- Returns 403 for authorization issues (not admin)
- Returns 500 for server errors

## Email Verification

### Enforcement

Email verification is **required** for login. Users cannot log in until they verify their email address.

**Implementation:**
- Check performed in `login` function in `authcontroller.js`
- Returns 403 status with clear error message if email not verified

### OTP System

- OTP expires after 15 minutes (registration) or 24 hours (resend)
- OTP stored in database with expiration timestamp
- OTP cleared after successful verification

## Password Reset

### Flow

1. User requests password reset with email
2. Backend generates OTP and sends to email
3. OTP expires after 15 minutes
4. User submits OTP and new password
5. Password updated and OTP cleared

## Security Best Practices

### Implemented ✅

- Password hashing with bcrypt (10 rounds)
- JWT tokens with expiration (7 days)
- httpOnly cookies for token storage
- Email verification required
- Admin route protection
- Token verification on every protected route

### Recommendations 🔄

1. **Token Refresh**: Implement refresh tokens for better security
2. **Rate Limiting**: Add rate limiting to auth endpoints
3. **Password Strength**: Enforce password strength requirements
4. **Account Lockout**: Implement account lockout after failed login attempts
5. **Session Management**: Add session management and logout from all devices
6. **2FA**: Consider two-factor authentication for admin accounts

## Error Messages

### Authentication Errors

- `"Access not authorized. Token required."` - No token provided
- `"Invalid token"` - Token signature invalid
- `"Token expired"` - Token has expired
- `"User not found"` - User doesn't exist in database

### Authorization Errors

- `"Access denied. Admin privileges required."` - User is not admin

### Email Verification Errors

- `"Please verify your email before logging in. Check your inbox for the verification OTP."` - Email not verified

## Testing Authentication

### Test User Login

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Test Admin Access

1. Ensure user has `isAdmin: true` in database
2. Login to get token
3. Use token in `Authorization: Bearer <token>` header
4. Access admin routes

### Test Email Verification

1. Register new user
2. Try to login - should fail with verification error
3. Verify email with OTP
4. Login should succeed

## Migration Notes

If you need to migrate existing users:

1. Set `isAccountVerified: true` for existing users
2. Or require them to verify on next login
3. Update frontend to handle verification flow







