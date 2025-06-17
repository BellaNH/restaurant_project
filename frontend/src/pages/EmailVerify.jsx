import React, { useContext, useEffect, useRef } from "react";
import axios from "axios";
import { useGlobalContext } from "../Context/Context";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  axios.defaults.withCredentials = true;

  const {registeredUserId,setRegisteredUserId,isLoggedin, userData, getUserData } = useGlobalContext();

  const navigate = useNavigate();

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

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");

      const { data } = await axios.post("http://localhost:4000/api/auth/verify-account",
        { otp ,
          userId:localStorage.getItem("registeredUserId")
        }
      );
      console.log(data)

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedin, userData]);
  
  const resendOTP = async ()=>{
    try{
      const response = await axios.post("http://localhost:4000/api/auth/send-verify-otp",{
        userId:localStorage.getItem("registeredUserId")
      })
      console.log(response)
    }
    catch(error){
      console.log(error)
    }
  }
  return (
    <div className="flex justify-center items-center pb-20 pt-8 bg-gradient-to-br from-[#FDC830] to-[#F37335] ">
      <form
        onSubmit={onSubmitHandler}
        className="h-fit mt-[10%] mx-auto bg-[#fff4f2] p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md text-sm"
      >
        <h1 className="text-[#b71c1c] text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-[#F9A825]">
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
              />
            ))}
        </div>
        <button type="submit" className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-[#F57F17] to-[#d9441c] text-white font-medium rounded-full hover:opacity-90 transition duration-200">
          Verify email
        </button>
        <p onClick={resendOTP}  className="cursor-pointer text-[#d9441c] hover:text-[#b71c1c] mt-4 text-sm text-center transition-colors duration-200">🔄 “Didn’t receive the OTP?OTP expired? Resend it.”</p>
      </form>
    </div>
  );
};

export default EmailVerify;