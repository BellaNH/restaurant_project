# Environment Variables Setup Guide

This guide explains how to set up environment variables for both frontend and backend.

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
MONGO_URL=mongodb://localhost:27017/restaurant_db

# JWT Secret Key (Generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Email Configuration (SMTP)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SENDER_EMAIL=your_email@gmail.com

# CORS Configuration (comma-separated list of allowed origins)
ALLOWED_ORIGINS=http://localhost:5173,https://restaurantw.netlify.app

# Frontend URL (for Stripe redirects)
FRONTEND_URL=http://localhost:5173
```

### Backend Variables Explained:

- **PORT**: The port number the backend server will run on (default: 4000)
- **NODE_ENV**: Environment mode - `development` or `production`
- **MONGO_URL**: MongoDB connection string
- **JWT_SECRET**: Secret key for signing JWT tokens (use a strong random string)
- **STRIPE_SECRET_KEY**: Your Stripe API secret key for payment processing
- **SMTP_USER**: Email address for sending emails (Gmail account)
- **SMTP_PASS**: App password for Gmail (not your regular password)
- **SENDER_EMAIL**: Email address that appears as sender
- **ALLOWED_ORIGINS**: Comma-separated list of frontend URLs allowed to access the API
- **FRONTEND_URL**: Frontend URL used for Stripe payment redirects

## Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory for local development:

```env
# API Base URL
VITE_API_URL=http://localhost:4000
```

For production, create a `.env.production` file:

```env
# API Base URL
VITE_API_URL=https://restaurant-project-ek2l.onrender.com
```

### Frontend Variables Explained:

- **VITE_API_URL**: The base URL of your backend API
  - For local development: `http://localhost:4000`
  - For production: Your deployed backend URL

## Setting Up Environment Variables

### Backend Setup:

1. Navigate to the `backend/` directory
2. Create a `.env` file
3. Copy the variables from above and fill in your actual values
4. **Important**: Never commit the `.env` file to version control

### Frontend Setup:

1. Navigate to the `frontend/` directory
2. Create `.env.local` for local development
3. Create `.env.production` for production builds
4. Fill in the `VITE_API_URL` with appropriate values

## Important Notes

1. **Security**: 
   - Never commit `.env` files to version control
   - Use strong, unique values for `JWT_SECRET`
   - Keep your Stripe keys secure

2. **Vite Environment Variables**:
   - Frontend environment variables must be prefixed with `VITE_` to be accessible in the browser
   - Changes to `.env` files require restarting the dev server

3. **Production Deployment**:
   - Set environment variables in your hosting platform (Netlify, Vercel, Render, etc.)
   - For backend: Set all variables in your hosting platform's environment settings
   - For frontend: Set `VITE_API_URL` in your build environment

## Generating a Strong JWT Secret

You can generate a strong JWT secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Or use an online generator and ensure it's at least 32 characters long.

## Gmail App Password Setup

To use Gmail for sending emails:

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account settings → Security
3. Under "2-Step Verification", click "App passwords"
4. Generate a new app password for "Mail"
5. Use this app password (not your regular password) as `SMTP_PASS`

## Troubleshooting

- **Frontend can't connect to backend**: Check that `VITE_API_URL` matches your backend URL
- **CORS errors**: Ensure your frontend URL is included in `ALLOWED_ORIGINS`
- **Email not sending**: Verify SMTP credentials and that app password is correct
- **JWT errors**: Ensure `JWT_SECRET` is set and consistent







