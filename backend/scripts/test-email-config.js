/**
 * Email Configuration Test Script
 * 
 * Run this script to test your email configuration:
 * node scripts/test-email-config.js
 * 
 * Or with nodemon:
 * nodemon scripts/test-email-config.js
 */

import "dotenv/config";
import transporter from "../config/nodemailer.js";
import { isSmtpVerified, getSmtpError } from "../config/nodemailer.js";

console.log("\n🔍 ========== EMAIL CONFIGURATION TEST ==========\n");

// Wait a bit for transporter.verify() to complete
await new Promise(resolve => setTimeout(resolve, 2000));

// Check environment variables
console.log("📋 Environment Variables Check:");
console.log(`   SMTP_USER: ${process.env.SMTP_USER || "❌ NOT SET"}`);
console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? `✅ SET (${process.env.SMTP_PASS.length} characters)` : "❌ NOT SET"}`);
console.log(`   SENDER_EMAIL: ${process.env.SENDER_EMAIL || "⚠️  NOT SET (will use SMTP_USER)"}`);
console.log("");

// Check SMTP verification
if (isSmtpVerified()) {
  console.log("✅ SMTP Server verified successfully");
} else {
  const error = getSmtpError();
  if (error) {
    console.log("❌ SMTP Server verification failed:");
    console.log(`   Error Code: ${error.code || "NO_CODE"}`);
    console.log(`   Error Message: ${error.message || "NO_MESSAGE"}`);
  } else {
    console.log("⚠️  SMTP Server verification still in progress...");
  }
}

console.log("");

// Test sending an email
const testEmail = process.env.SMTP_USER || process.env.TEST_EMAIL;

if (!testEmail) {
  console.log("❌ No email address to test with.");
  console.log("   Set TEST_EMAIL in .env or use SMTP_USER");
  process.exit(1);
}

console.log(`📧 Attempting to send test email to: ${testEmail}`);
console.log("");

try {
  const mailOptions = {
    from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
    to: testEmail,
    subject: "Test Email - Restaurant App Configuration",
    text: "This is a test email from your Restaurant App. If you received this, your email configuration is working correctly!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333;">✅ Email Configuration Test</h2>
          <p>This is a <strong>test email</strong> from your Restaurant App.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toISOString()}<br>
            From: ${process.env.SENDER_EMAIL || process.env.SMTP_USER}
          </p>
        </div>
      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);

  console.log("✅ ========== EMAIL SENT SUCCESSFULLY ==========");
  console.log(`✅ Message ID: ${result.messageId}`);
  console.log(`✅ Response: ${result.response}`);
  console.log(`✅ To: ${testEmail}`);
  console.log("✅ Check your inbox (and spam folder) for the test email");
  console.log("✅ ============================================\n");
} catch (error) {
  console.error("❌ ========== EMAIL SENDING FAILED ==========");
  console.error(`❌ Error Code: ${error.code || "NO_CODE"}`);
  console.error(`❌ Error Message: ${error.message || "NO_MESSAGE"}`);
  console.error(`❌ Command: ${error.command || "NO_COMMAND"}`);
  console.error("❌ ============================================");
  
  if (error.code === "EAUTH") {
    console.error("\n🔧 SOLUTION: Gmail Authentication Error");
    console.error("   1. Make sure you're using an App Password, not your regular Gmail password");
    console.error("   2. Enable 2-Step Verification on your Google Account");
    console.error("   3. Generate an App Password at: https://myaccount.google.com/apppasswords");
    console.error("   4. Use the 16-character App Password in SMTP_PASS (no spaces)");
    console.error("   5. Make sure SMTP_USER is your full email address");
  } else if (error.code === "ECONNECTION") {
    console.error("\n🔧 SOLUTION: Connection Error");
    console.error("   1. Check your internet connection");
    console.error("   2. Verify firewall isn't blocking SMTP connections");
    console.error("   3. Try again after a few minutes");
  } else if (error.code === "ETIMEDOUT") {
    console.error("\n🔧 SOLUTION: Timeout Error");
    console.error("   1. Gmail SMTP is slow or unresponsive");
    console.error("   2. Try again after a few minutes");
    console.error("   3. Consider using a different email service for production");
  }
  
  console.error("");
  process.exit(1);
}

