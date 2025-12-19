GMAIL SMTP SETUP GUIDE

Gmail has changed their security requirements. You CANNOT use your regular Gmail password anymore. You need to generate an App Password.

STEP 1: ENABLE 2-FACTOR AUTHENTICATION

1. Go to your Google Account: https://myaccount.google.com/
2. Click Security on the left sidebar
3. Under Signing in to Google, find 2-Step Verification
4. If not enabled, click Get Started and follow the steps to enable it
5. This is REQUIRED before you can create an App Password

STEP 2: GENERATE APP PASSWORD

1. Go back to Security settings: https://myaccount.google.com/security
2. Under Signing in to Google, find App passwords
3. Click App passwords
4. You may need to sign in again
5. Select Mail as the app type
6. Select Other (Custom name) as the device type
7. Enter a name like Restaurant App or Node.js App
8. Click Generate
9. Google will show you a 16-character password (like: abcd efgh ijkl mnop)
10. Copy this password - you will not see it again

STEP 3: UPDATE YOUR .ENV FILE

In your backend .env file, update SMTP_PASS with the App Password:

SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SENDER_EMAIL=your-email@gmail.com

Important notes:
- Use the App Password (16 characters, no spaces) in SMTP_PASS
- Do NOT use your regular Gmail password
- The App Password should be 16 characters without spaces
- SMTP_USER should be your full Gmail address

STEP 4: VERIFY CONFIGURATION

After updating .env and restarting your server, check the server logs. You should see:

- If successful: SMTP Server is ready to send emails
- If failed: SMTP Configuration Error with details

COMMON ERRORS AND SOLUTIONS

Error: Invalid login or EAUTH
- Solution: Make sure you're using App Password, not regular password
- Solution: Ensure 2-Step Verification is enabled
- Solution: Check that SMTP_USER is your full email address

Error: ECONNECTION
- Solution: Check your internet connection
- Solution: Verify Gmail SMTP is not blocked by firewall
- Solution: Try again after a few minutes

Error: Less secure app access
- Solution: This feature is deprecated. You MUST use App Password instead

TESTING EMAIL SENDING

After setup, test registration again. Check your server logs for:
- [REGISTER] Background: Attempting to send email
- [REGISTER] Background: Email sent successfully

If you see errors, the logs will now show detailed error messages to help diagnose the issue.

ALTERNATIVE: USE DIFFERENT EMAIL PROVIDER

If Gmail continues to cause issues, consider:
- SendGrid (free tier: 100 emails/day)
- Mailgun (free tier: 5000 emails/month)
- AWS SES (pay as you go)
- Resend (free tier: 3000 emails/month)

These services are more reliable for production applications and have better documentation.


