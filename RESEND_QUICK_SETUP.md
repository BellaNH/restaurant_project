RESEND QUICK SETUP GUIDE
========================

Step-by-step instructions to get Resend working in 5 minutes.

STEP 1: CREATE RESEND ACCOUNT
------------------------------
1. Go to https://resend.com
2. Click "Sign Up" (top right)
3. Enter your email and create a password
4. Verify your email address
5. You're in! No credit card required.

STEP 2: GET YOUR API KEY
-------------------------
1. In Resend dashboard, click "API Keys" in the left sidebar
2. Click the "Create API Key" button
3. Give it a name: "Restaurant App" (or anything you want)
4. Click "Create"
5. COPY THE API KEY NOW - you won't see it again!
   It looks like: re_1234567890abcdefghijklmnop

STEP 3: UPDATE YOUR .ENV FILE
------------------------------
Open your backend/.env file and add/update these lines:

EMAIL_PROVIDER=resend
RESEND_API_KEY=re_paste_your_api_key_here
SENDER_EMAIL=onboarding@resend.dev

IMPORTANT NOTES:
- Replace "re_paste_your_api_key_here" with the actual API key you copied
- onboarding@resend.dev is a TEST email - you don't need to create it
- This test email works immediately, no setup needed
- For production later, you can verify your own domain

STEP 4: RESTART YOUR SERVER
----------------------------
1. Stop your backend server (Ctrl+C)
2. Start it again (npm start or npm run server)
3. Look for this message in the logs:
   ✅ Email Provider: RESEND
   ✅ Resend API key found
   ✅ Email server is ready to send emails

STEP 5: TEST IT!
----------------
1. Try registering a new user
2. Check your email inbox
3. You should receive the OTP email!

TROUBLESHOOTING
===============

Problem: "RESEND_API_KEY must be set"
Solution: Make sure you copied the API key correctly in .env file

Problem: "Email server is ready" but no emails arrive
Solution: 
- Check spam folder
- Wait a few seconds (emails send in background)
- Check server logs for email sending errors

Problem: Want to use your own email address
Solution:
- Go to Resend dashboard → Domains
- Add your domain (e.g., yourdomain.com)
- Add the DNS records they provide
- Wait for verification (usually a few minutes)
- Then use: SENDER_EMAIL=noreply@yourdomain.com

That's it! You're ready to send emails with Resend! 🎉
