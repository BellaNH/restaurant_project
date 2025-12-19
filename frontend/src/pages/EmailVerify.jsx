import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useGlobalContext } from "../Context/Context";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  axios.defaults.withCredentials = true;

  const { url, registeredUserId } = useGlobalContext();
  const navigate = useNavigate();

  const inputRefs = useRef([]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  // Log when component mounts/updates
  useEffect(() => {
    console.log(`[EMAIL_VERIFY] ========== COMPONENT MOUNTED/UPDATED ==========`);
    console.log(`[EMAIL_VERIFY] Timestamp: ${new Date().toISOString()}`);
    console.log(`[EMAIL_VERIFY] API URL: ${url}`);
    console.log(`[EMAIL_VERIFY] registeredUserId from context:`, registeredUserId);
    console.log(`[EMAIL_VERIFY] registeredUserId from localStorage:`, localStorage.getItem("registeredUserId"));
    
    const finalUserId = registeredUserId || localStorage.getItem("registeredUserId");
    console.log(`[EMAIL_VERIFY] Final userId to use: ${finalUserId}`);
    
    if (!finalUserId) {
      console.error(`[EMAIL_VERIFY] ERROR: No userId found in context or localStorage!`);
      console.error(`[EMAIL_VERIFY] Context registeredUserId:`, registeredUserId);
      console.error(`[EMAIL_VERIFY] localStorage registeredUserId:`, localStorage.getItem("registeredUserId"));
      console.error(`[EMAIL_VERIFY] All localStorage keys:`, Object.keys(localStorage));
    } else {
      console.log(`[EMAIL_VERIFY] UserId found: ${finalUserId} - Ready for OTP verification`);
    }
    console.log(`[EMAIL_VERIFY] ==============================================`);
  }, [registeredUserId, url]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    console.log(`[EMAIL_VERIFY] ========== OTP VERIFICATION STARTED ==========`);
    console.log(`[EMAIL_VERIFY] Timestamp: ${new Date().toISOString()}`);

    const otpArray = inputRefs.current.map((input) => input?.value || "");
    const otp = otpArray.join("");
    console.log(`[EMAIL_VERIFY] OTP entered: ${otp.length === 6 ? "******" : otp} (length: ${otp.length})`);

    if (otp.length !== 6) {
      console.error(`[EMAIL_VERIFY] ERROR: Incomplete OTP (${otp.length} digits instead of 6)`);
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    const userId = registeredUserId || localStorage.getItem("registeredUserId");
    console.log(`[EMAIL_VERIFY] UserId from context: ${registeredUserId}`);
    console.log(`[EMAIL_VERIFY] UserId from localStorage: ${localStorage.getItem("registeredUserId")}`);
    console.log(`[EMAIL_VERIFY] Final userId: ${userId}`);
    
    if (!userId) {
      console.error(`[EMAIL_VERIFY] ERROR: Missing userId!`);
      console.error(`[EMAIL_VERIFY] Context registeredUserId:`, registeredUserId);
      console.error(`[EMAIL_VERIFY] localStorage registeredUserId:`, localStorage.getItem("registeredUserId"));
      toast.error("Missing user information. Please sign up again.");
      return;
    }

    console.log(`[EMAIL_VERIFY] Sending verification request...`);
    console.log(`[EMAIL_VERIFY] API URL: ${url}/api/auth/verify-account`);
    console.log(`[EMAIL_VERIFY] Request payload: { otp: "******", userId: "${userId}" }`);
    
    setSubmitting(true);
    const requestStartTime = Date.now();
    
    try {
      const { data } = await axios.post(
        `${url}/api/auth/verify-account`,
        { otp, userId },
        { timeout: 30000, withCredentials: true } // Increased timeout
      );

      const requestTime = Date.now() - requestStartTime;
      console.log(`[EMAIL_VERIFY] Verification request completed in ${requestTime}ms`);
      console.log(`[EMAIL_VERIFY] Response data:`, data);

      if (data.success) {
        console.log(`[EMAIL_VERIFY] ========== VERIFICATION SUCCESS ==========`);
        console.log(`[EMAIL_VERIFY] Success message: ${data.message || "Email verified successfully."}`);
        toast.success(data.message || "Email verified successfully.");
        console.log(`[EMAIL_VERIFY] Navigating to home page...`);
        navigate("/");
      } else {
        console.error(`[EMAIL_VERIFY] Verification failed - no success flag`);
        console.error(`[EMAIL_VERIFY] Error message: ${data.message || "Failed to verify email."}`);
        toast.error(data.message || "Failed to verify email.");
      }
    } catch (error) {
      const requestTime = Date.now() - requestStartTime;
      console.error(`[EMAIL_VERIFY] ========== VERIFICATION ERROR AFTER ${requestTime}ms ==========`);
      console.error(`[EMAIL_VERIFY] Error type: ${error.name || "Unknown"}`);
      console.error(`[EMAIL_VERIFY] Error message: ${error.message || "No message"}`);
      console.error(`[EMAIL_VERIFY] Error code: ${error.code || "No code"}`);
      console.error(`[EMAIL_VERIFY] Error response:`, error.response);
      console.error(`[EMAIL_VERIFY] Error response status:`, error.response?.status);
      console.error(`[EMAIL_VERIFY] Error response data:`, error.response?.data);
      console.error(`[EMAIL_VERIFY] Full error:`, error);
      
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to verify email. Please try again.";
      
      console.error(`[EMAIL_VERIFY] Final error message: ${errorMessage}`);
      console.error(`[EMAIL_VERIFY] ==========================================`);
      
      toast.error(errorMessage);
    } finally {
      console.log(`[EMAIL_VERIFY] Setting submitting state to false`);
      setSubmitting(false);
      console.log(`[EMAIL_VERIFY] ========== OTP VERIFICATION ENDED ==========`);
    }
  };
  
  const resendOTP = async () => {
    const userId = registeredUserId || localStorage.getItem("registeredUserId");
    if (!userId) {
      console.error("[RESEND_OTP] Missing userId:", { registeredUserId, localStorageUserId: localStorage.getItem("registeredUserId") });
      toast.error("Missing user information. Please sign up again.");
      return;
    }

    console.log("[RESEND_OTP] Starting resend OTP request");
    console.log("[RESEND_OTP] UserId:", userId);
    console.log("[RESEND_OTP] API URL:", `${url}/api/auth/send-verify-otp`);

    setResending(true);
    try {
      const { data } = await axios.post(
        `${url}/api/auth/send-verify-otp`,
        { userId },
        { timeout: 15000, withCredentials: true }
      );

      console.log("[RESEND_OTP] Response received:", data);

      if (data.success) {
        toast.success(data.message || "Verification OTP sent to your email.");
      } else {
        console.error("[RESEND_OTP] Request failed:", data);
        toast.error(data.message || "Failed to resend OTP.");
      }
    } catch (error) {
      console.error("[RESEND_OTP] ========== ERROR ==========");
      console.error("[RESEND_OTP] Error object:", error);
      console.error("[RESEND_OTP] Error response:", error.response);
      console.error("[RESEND_OTP] Error status:", error.response?.status);
      console.error("[RESEND_OTP] Error data:", error.response?.data);
      console.error("[RESEND_OTP] Error message:", error.message);
      console.error("[RESEND_OTP] Request URL:", error.config?.url);
      console.error("[RESEND_OTP] Request method:", error.config?.method);
      console.error("[RESEND_OTP] Request data:", error.config?.data);
      console.error("[RESEND_OTP] ===========================");

      let errorMessage = "Failed to resend OTP. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 404) {
          errorMessage = errorData?.message || `Endpoint not found: ${error.config?.url}`;
          if (errorData?.availableRoutes) {
            console.log("[RESEND_OTP] Available routes:", errorData.availableRoutes);
          }
        } else if (status === 400) {
          errorMessage = errorData?.message || "Invalid request. Please check your input.";
          if (errorData?.errors && Array.isArray(errorData.errors)) {
            errorMessage += ` Errors: ${errorData.errors.join(", ")}`;
          }
        } else if (status === 429) {
          errorMessage = errorData?.message || "Too many requests. Please wait before trying again.";
        } else if (status === 500) {
          errorMessage = errorData?.message || "Server error. Please try again later.";
          if (errorData?.details) {
            errorMessage += ` Details: ${errorData.details}`;
          }
        } else {
          errorMessage = errorData?.message || error.message || errorMessage;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your connection.";
        console.error("[RESEND_OTP] No response received. Request:", error.request);
      } else {
        // Error setting up the request
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };
  return (
    <div className="flex justify-center items-center pb-20 pt-8 bg-gradient-to-br from-[#FDC830] to-[#F37335] ">
      <form
        onSubmit={onSubmitHandler}
        className="h-fit mt-[10%] mx-auto bg-[#fff4f2] p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md text-sm"
      >
        <h1 className="text-[#b71c1c] text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p
          className="text-center mb-6 text-[#F9A825]"
          id="email-verify-instructions"
          aria-live="polite"
        >
          Enter the 6-digit code sent to your email id.
        </p>
        <div className="flex justify-between gap-1 sm:gap-2 mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                required
                className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F9A825] text-black text-center text-lg sm:text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-[#b71c1c]"
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`OTP digit ${index + 1}`}
                aria-describedby="email-verify-instructions"
              />
            ))}
        </div>
        <button
          type="submit"
          className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-[#F57F17] to-[#d9441c] text-white font-medium rounded-full hover:opacity-90 transition duration-200 disabled:opacity-70"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Verifying..." : "Verify email"}
        </button>
        <button
          type="button"
          onClick={resendOTP}
          className="w-full mt-4 text-sm text-center text-[#d9441c] hover:text-[#b71c1c] transition-colors duration-200 disabled:opacity-70"
          disabled={resending}
          aria-busy={resending}
        >
          {resending ? "Resending OTP..." : "🔄 Didn’t receive the OTP or it expired? Resend it."}
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;