// Shared constants for backend

export const DELIVERY_FEE = 2; // USD

// OTP expiry times (in milliseconds)
export const VERIFY_OTP_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
export const REGISTER_OTP_EXPIRY = 15 * 60 * 1000;    // 15 minutes
export const RESET_OTP_EXPIRY = 15 * 60 * 1000;       // 15 minutes

// OTP attempt limits
export const MAX_VERIFY_OTP_ATTEMPTS = 5;
export const MAX_RESET_OTP_ATTEMPTS = 5;

// Login security
export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCK_TIME = 15 * 60 * 1000; // 15 minutes

// Session / refresh token configuration
export const REFRESH_TOKEN_DAYS = 7; // Refresh token & session lifetime in days

// Stripe configuration
export const STRIPE_CURRENCY = "usd";




