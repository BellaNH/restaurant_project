import React, { useContext, useRef, useState } from "react";
import { assets } from "../assets/frontend_assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {

  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState("");
  const [otp, setOtp] = useState(0);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const inputRefs = useRef([]);

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

  const onSubmitEmail = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post("http://localhost:4000/api/auth/send-reset-otp",
        { email }
      );
      console.log(data)
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setIsEmailSent(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitOTP = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((e) => e.value);
    setOtp(otpArray.join(""));
    setIsOtpSubmitted(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post("http://localhost:4000/api/auth/reset-password",
        { email, otp, newPassword }
      );

      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center pb-20 pt-8 bg-gradient-to-br from-[#ff7e5f] to-[#feb47b] ">
      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
         className="h-fit mt-[10%] mx-auto bg-[#fff4f2] p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md text-sm"

        >
          <h1 className="text-[#b71c1c] text-2xl font-semibold text-center mb-4">
            Reset password
          </h1>
          <p className="text-center mb-6 text-[#F9A825]">
            Enter your registered email address
          </p>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-white">
  <img src={assets.mail_icon} alt="mail_icon" className="w-3 h-3" />
  <input
    type="email"
    placeholder="Email id"
    className="bg-transparent outline-none text-[#323232]"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
</div>

          <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-[#EF5350] to-[#d32f2f] text-white rounded-full mt-3">

            Submit
          </button>
        </form>
      )}

  
      {!isOtpSubmitted && isEmailSent && (
       <form
  onSubmit={onSubmitOTP}
  className="h-fit mt-[10%] mx-auto bg-[#fff4f2] p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md text-xs sm:text-sm"
>
  <h1 className="text-[#b71c1c] text-xl sm:text-2xl font-semibold text-center mb-4">
    Reset password OTP
  </h1>
  <p className="text-center mb-6 text-[#F9A825] text-[0.85rem] sm:text-base">
    Enter the 6-digit code sent to your email id.
  </p>

  <div
    className="flex justify-between gap-1 sm:gap-2 mb-8"
    onPaste={handlePaste}
  >
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
        />
      ))}
  </div>

  <button
    type="submit"
    className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-[#F57F17] to-[#d9441c] text-white font-medium rounded-full hover:opacity-90 transition duration-200"
  >
    Submit
  </button>
</form>

      )}


      {isOtpSubmitted && isEmailSent && (
        <form
          onSubmit={onSubmitNewPassword}
         className="bg-[#fff4f2] p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md text-sm"

        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the new password below
          </p>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="lock_icon" className="w-3 h-3" />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;