EMAIL PROVIDER SETUP GUIDE

This guide shows how to set up free email services that don't require a credit card.

OPTION 1: RESEND (RECOMMENDED)
==============================

Free Tier: 3,000 emails/month, 100 emails/day
No credit card required
Fast and reliable

Setup Steps:
1. Sign up at https://resend.com (free account)
2. Go to API Keys section in dashboard
3. Create a new API key
4. Copy the API key
5. Add domain (optional but recommended) or use their test domain
6. Update your .env file:

EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
SENDER_EMAIL=onboarding@resend.dev  (or your verified domain email)

OPTION 2: BREVO (SENDINBLUE)
=============================

Free Tier: 300 emails/day
No credit card required
Good for higher volume

Setup Steps:
1. Sign up at https://www.brevo.com (free account)
2. Go to Settings > SMTP & API
3. Generate an SMTP key
4. Update your .env file:

EMAIL_PROVIDER=brevo
SMTP_USER=your_brevo_email@example.com
SMTP_PASS=your_smtp_key_here
SENDER_EMAIL=your_brevo_email@example.com

OPTION 3: MAILGUN (LIMITED FREE)
=================================

Free Tier: 5,000 emails/month for first 3 months
Requires credit card after 3 months

Setup Steps:
1. Sign up at https://www.mailgun.com
2. Verify your domain
3. Get SMTP credentials
4. Update your .env file:

EMAIL_PROVIDER=mailgun
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your_mailgun_smtp_password
SENDER_EMAIL=noreply@your-domain.com

CONFIGURATION
=============

The code now supports multiple providers. Set EMAIL_PROVIDER in .env:
- "gmail" - Gmail SMTP (requires App Password)
- "resend" - Resend API (recommended, easiest)
- "brevo" - Brevo/Sendinblue SMTP
- "mailgun" - Mailgun SMTP

For Resend, you only need:
- EMAIL_PROVIDER=resend
- RESEND_API_KEY=your_api_key
- SENDER_EMAIL=onboarding@resend.dev (or your verified domain)

For Gmail/Brevo/Mailgun, you need:
- EMAIL_PROVIDER=gmail (or brevo, mailgun)
- SMTP_USER=your_email
- SMTP_PASS=your_password_or_api_key
- SENDER_EMAIL=your_email


