import nodemailer from "nodemailer";

// Validate required environment variables
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error("ERROR: SMTP_USER and SMTP_PASS must be set in environment variables");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Add connection timeout settings for slow networks
  connectionTimeout: 60000, // 60 seconds
  socketTimeout: 60000, // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  // Retry settings
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Configuration Error:", error.message);
    console.error("Please check your SMTP_USER and SMTP_PASS in .env file");
    console.error("For Gmail, you need to use an App Password, not your regular password");
  } else {
    console.log("SMTP Server is ready to send emails");
  }
});

export default transporter;