import nodemailer from "nodemailer";

// Determine email provider from environment variable
const emailProvider = (process.env.EMAIL_PROVIDER || "gmail").toLowerCase();

console.log(`📧 Email Provider: ${emailProvider.toUpperCase()}`);

let transporter;

// Configure transporter based on provider
if (emailProvider === "resend") {
  // Resend configuration (recommended - free, no credit card)
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ ERROR: RESEND_API_KEY must be set for Resend provider");
    console.error("❌ Get your API key from: https://resend.com/api-keys");
  } else {
    console.log("✅ Resend API key found");
    transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
      connectionTimeout: 30000, // 30 seconds
      socketTimeout: 30000,
    });
    console.log("✅ Resend transporter configured");
  }
} else if (emailProvider === "brevo" || emailProvider === "sendinblue") {
  // Brevo (formerly Sendinblue) configuration
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ ERROR: SMTP_USER and SMTP_PASS must be set for Brevo provider");
    console.error("❌ Get your SMTP credentials from: https://www.brevo.com/settings/keys/api");
  } else {
    console.log("✅ Brevo SMTP credentials found");
    transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 30000,
      socketTimeout: 30000,
    });
    console.log("✅ Brevo transporter configured");
  }
} else if (emailProvider === "mailgun") {
  // Mailgun configuration
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ ERROR: SMTP_USER and SMTP_PASS must be set for Mailgun provider");
  } else {
    console.log("✅ Mailgun SMTP credentials found");
    transporter = nodemailer.createTransport({
      host: "smtp.mailgun.org",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 30000,
      socketTimeout: 30000,
    });
    console.log("✅ Mailgun transporter configured");
  }
} else {
  // Default: Gmail configuration
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ ERROR: SMTP_USER and SMTP_PASS must be set for Gmail provider");
    console.error("❌ Please check your .env file in the backend/ directory");
    console.error("❌ Required variables: SMTP_USER, SMTP_PASS");
  } else {
    console.log("✅ Gmail SMTP credentials found");
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 60000, // 60 seconds for slow Gmail
      socketTimeout: 60000,
      greetingTimeout: 30000,
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
    });
    console.log("✅ Gmail transporter configured");
  }
}

// Fallback: Create a dummy transporter if configuration failed
if (!transporter) {
  console.error("❌ WARNING: No valid email transporter configured!");
  console.error("❌ Email sending will fail. Please check your .env configuration.");
  // Create a dummy transporter to prevent crashes
  transporter = nodemailer.createTransport({
    host: "localhost",
    port: 25,
    secure: false,
    auth: {
      user: "dummy",
      pass: "dummy",
    },
  });
}

// Verify transporter configuration on startup with better error handling
let smtpVerified = false;
let smtpError = null;

transporter.verify((error, success) => {
  if (error) {
    smtpError = error;
    console.error("❌ ========== SMTP CONFIGURATION ERROR ==========");
    console.error("❌ Error Code:", error.code || "NO_CODE");
    console.error("❌ Error Message:", error.message || "NO_MESSAGE");
    console.error("❌ Command:", error.command || "NO_COMMAND");
    console.error("❌ ============================================");
    console.error("❌ Please check your SMTP_USER and SMTP_PASS in .env file");
    console.error("❌ For Gmail, you need to use an App Password, not your regular password");
    console.error("❌ Steps to fix:");
    console.error("   1. Enable 2-Step Verification on your Google Account");
    console.error("   2. Generate an App Password at: https://myaccount.google.com/apppasswords");
    console.error("   3. Use the 16-character App Password in SMTP_PASS");
    console.error("   4. Make sure SMTP_USER is your full email address");
    console.error("   5. Restart your server after updating .env");
    console.error("❌ ============================================");
  } else {
    smtpVerified = true;
    console.log("✅ ========== EMAIL SERVER READY ==========");
    console.log("✅ Email server is ready to send emails");
    console.log(`✅ Provider: ${emailProvider.toUpperCase()}`);
    console.log("✅ From:", process.env.SENDER_EMAIL || process.env.SMTP_USER || "Not set");
    console.log("✅ ======================================");
  }
});

// Export a function to check if SMTP is verified
export const isSmtpVerified = () => smtpVerified;
export const getSmtpError = () => smtpError;

export default transporter;