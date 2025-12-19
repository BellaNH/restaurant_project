import React, { useRef, useState, useEffect } from "react";
import { assets } from "../assets/frontend_assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useGlobalContext } from "../Context/Context";
import "./ResetPassword.css";

const ResetPassword = () => {
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const { url } = useGlobalContext();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index].value = value;
      inputRefs.current[index + 1].focus();
    } else if (value.length > 0) {
      inputRefs.current[index].value = value;
    }
    updateOtpState();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    const pasteArray = paste.split("").slice(0, 6);
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
    if (pasteArray.length > 0) {
      inputRefs.current[Math.min(pasteArray.length - 1, 5)].focus();
    }
    updateOtpState();
  };

  const updateOtpState = () => {
    const otpArray = inputRefs.current.map((ref) => ref?.value || "").join("");
    setOtp(otpArray);
    if (status.type === "error") {
      setStatus({ type: null, message: "" });
    }
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setStatus({ type: "error", message: "Email is required." });
      return false;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return false;
    }
    return true;
  };

  const validateOtp = () => {
    const otpValue = inputRefs.current.map((ref) => ref?.value || "").join("");
    if (otpValue.length !== 6) {
      setStatus({ type: "error", message: "Please enter the complete 6-digit OTP." });
      return false;
    }
    if (!/^\d{6}$/.test(otpValue)) {
      setStatus({ type: "error", message: "OTP must contain only numbers." });
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const pwd = newPassword || "";

    if (!pwd.trim()) {
      setStatus({ type: "error", message: "Password is required." });
      return false;
    }
    // Mirror backend validatePassword rules:
    // - at least 8 characters
    // - at least one lowercase, one uppercase, and one number
    if (pwd.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters long." });
      return false;
    }
    if (!/[a-z]/.test(pwd)) {
      setStatus({ type: "error", message: "Password must contain at least one lowercase letter." });
      return false;
    }
    if (!/[A-Z]/.test(pwd)) {
      setStatus({ type: "error", message: "Password must contain at least one uppercase letter." });
      return false;
    }
    if (!/[0-9]/.test(pwd)) {
      setStatus({ type: "error", message: "Password must contain at least one number." });
      return false;
    }
    if (pwd !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return false;
    }
    return true;
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setSubmittingEmail(true);
    setStatus({ type: null, message: "" });

    try {
      // Increased timeout to 15 seconds to handle slower database queries
      const response = await axios.post(
        `${url}/api/auth/send-reset-otp`,
        { email },
        { timeout: 15000 }
      );
      
      // Success response (200)
      const data = response.data;
      
      // Always reset submitting state immediately after response
      setSubmittingEmail(false);
      
      if (data && data.success === true) {
        // Valid user - OTP sent successfully
        const successMsg = data.message || "OTP sent successfully to your email.";
        setStatus({ type: "success", message: successMsg });
        toast.success(successMsg);
        setIsEmailSent(true);
      } else {
        // Should not happen with proper backend, but handle it anyway
        const errorMsg = data?.message || "Failed to send OTP.";
        setStatus({ type: "error", message: errorMsg });
        toast.error(errorMsg);
      }
    } catch (error) {
      // Always reset submitting state on error
      setSubmittingEmail(false);
      
      let errorMessage = "Failed to send OTP. Please try again.";
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.response) {
        // Server responded with error status (4xx, 5xx)
        // Backend now returns proper status codes: 404 for user not found, 400 for bad request, 500 for server errors
        const status = error.response.status;
        const serverMsg = error.response.data?.message || error.response.data?.error;
        
        if (status === 404) {
          // User not found - backend returns "This user doesn't exist."
          errorMessage = serverMsg || "This user doesn't exist.";
        } else if (status === 400) {
          // Bad request (e.g., missing email)
          errorMessage = serverMsg || "Invalid request. Please check your input.";
        } else if (status >= 500) {
          // Server error
          errorMessage = serverMsg || "Server error. Please try again later.";
        } else if (serverMsg) {
          // Other 4xx errors
          errorMessage = serverMsg;
        } else {
          errorMessage = `Error: ${status}`;
        }
      } else if (error.request) {
        // Request made but no response received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
      setStatus({ type: "error", message: errorMessage });
      toast.error(errorMessage);
    }
  };

  const onSubmitOTP = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    const otpValue = inputRefs.current.map((ref) => ref?.value || "").join("");
    setOtp(otpValue);
    setIsOtpSubmitted(true);
    setStatus({ type: null, message: "" });
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setSubmittingPassword(true);
    setStatus({ type: null, message: "" });

    try {
      const { data } = await axios.post(
        `${url}/api/auth/reset-password`,
        { email, otp, newPassword },
        { timeout: 10000 }
      );

      // Always reset submitting state immediately after response
      setSubmittingPassword(false);

      if (data && data.success) {
        setStatus({ type: "success", message: data.message || "Password reset successfully!" });
        toast.success(data.message || "Password reset successfully!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        const errorMsg = data?.message || "Failed to reset password.";
        setStatus({ type: "error", message: errorMsg });
        toast.error(errorMsg);
      }
    } catch (error) {
      // Always reset submitting state on error
      setSubmittingPassword(false);
      
      let errorMessage = "Failed to reset password. Please try again.";
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setStatus({ type: "error", message: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Clear status when inputs change
  useEffect(() => {
    if (status.type === "error") {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [email, newPassword, confirmPassword, status.type]);

  return (
    <div className="reset-password-container">
      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} className="reset-password-form fade-in">
          <h1 className="reset-password-title">Reset Password</h1>
          <p className="reset-password-subtitle">Enter your registered email address</p>

          {status.message && (
            <div
              id="reset-status"
              className={`reset-notification ${status.type === "error" ? "reset-notification-error" : "reset-notification-success"}`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </div>
          )}

          <div className="reset-input-wrapper">
            <img src={assets.mail_icon} alt="mail icon" className="reset-input-icon" />
            <input
              type="email"
              placeholder="Email address"
              className="reset-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status.type === "error") {
                  setStatus({ type: null, message: "" });
                }
              }}
              required
              disabled={submittingEmail}
              aria-invalid={status.type === "error"}
              aria-describedby={status.message ? "reset-status" : undefined}
            />
          </div>

          <button
            type="submit"
            className="reset-submit-btn"
            disabled={submittingEmail}
            aria-busy={submittingEmail}
            aria-describedby={status.message ? "reset-status" : undefined}
          >
            {submittingEmail ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {!isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitOTP} className="reset-password-form fade-in">
          <h1 className="reset-password-title">Enter OTP</h1>
          <p className="reset-password-subtitle">Enter the 6-digit code sent to your email</p>

          {status.message && (
            <div
              id="reset-status"
              className={`reset-notification ${status.type === "error" ? "reset-notification-error" : "reset-notification-success"}`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </div>
          )}

          <div className="reset-otp-container" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  key={index}
                  className="reset-otp-input"
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
          </div>

          <button
            type="submit"
            className="reset-submit-btn"
            aria-describedby={status.message ? "reset-status" : undefined}
          >
            Continue
          </button>
        </form>
      )}

      {isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitNewPassword} className="reset-password-form fade-in">
          <h1 className="reset-password-title">New Password</h1>
          <p className="reset-password-subtitle">Enter your new password</p>

          {status.message && (
            <div
              id="reset-status"
              className={`reset-notification ${status.type === "error" ? "reset-notification-error" : "reset-notification-success"}`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </div>
          )}

          <div className="reset-input-wrapper">
            <img src={assets.lock_icon} alt="lock icon" className="reset-input-icon" />
            <input
              type="password"
              placeholder="New password"
              className="reset-input"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (status.type === "error") {
                  setStatus({ type: null, message: "" });
                }
              }}
              required
              disabled={submittingPassword}
              minLength={8}
              aria-invalid={status.type === "error"}
              aria-describedby={status.message ? "reset-status" : undefined}
            />
          </div>

          <div className="reset-input-wrapper">
            <img src={assets.lock_icon} alt="lock icon" className="reset-input-icon" />
            <input
              type="password"
              placeholder="Confirm password"
              className="reset-input"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (status.type === "error") {
                  setStatus({ type: null, message: "" });
                }
              }}
              required
              disabled={submittingPassword}
              minLength={8}
              aria-invalid={status.type === "error"}
              aria-describedby={status.message ? "reset-status" : undefined}
            />
          </div>

          <button
            type="submit"
            className="reset-submit-btn"
            disabled={submittingPassword}
            aria-busy={submittingPassword}
            aria-describedby={status.message ? "reset-status" : undefined}
          >
            {submittingPassword ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;