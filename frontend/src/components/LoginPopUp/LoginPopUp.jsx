import "./LoginPopUp.css";
import { assets } from "../../assets/frontend_assets/assets";
import { useEffect, useState } from "react";
import { useGlobalContext } from "../../Context/Context";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LoginPopUp = ({ showLogin, setShowLogin }) => {
    const { url, setRegisteredUserId, setIsLoggedin, userType } = useGlobalContext();
    const [currentState,setCurrentState] = useState("Login")
    const navigate = useNavigate()
    const [data,setData]= useState({
        name:"",
        email:"",
        password:"",
        confirmPassword:""
    })
    const [status,setStatus] = useState({type:null,message:""})
    const [submitting,setSubmitting] = useState(false)

    const onChangeHandler = (e)=>{
        const {name,value} = e.target
        setData(prev=>({...prev,[name]:value}))
        if(status.type === "error"){
            setStatus({type:null,message:""})
        }
    }

    const getPasswordStrength = (password) => {
        if (!password) return "";
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return "Weak";
        if (score <= 4) return "Medium";
        return "Strong";
    };

    const validateForm = ()=>{
        if(currentState === "Sign Up" && !data.name.trim()){
            setStatus({type:"error",message:"Please enter a username."})
            return false
        }
        if(!data.email.trim()){
            setStatus({type:"error",message:"Email is required."})
            return false
        }
        const emailRegex = /^\S+@\S+\.\S+$/
        if(!emailRegex.test(data.email)){
            setStatus({type:"error",message:"Please enter a valid email address."})
            return false
        }
        // Frontend password checks should mirror backend validatePassword:
        // - at least 8 characters
        // - at least one lowercase, one uppercase, and one number
        const password = data.password || ""
        if(password.length < 8){
            setStatus({type:"error",message:"Password must be at least 8 characters long."})
            return false
        }
        if(!/[a-z]/.test(password)){
            setStatus({type:"error",message:"Password must contain at least one lowercase letter."})
            return false
        }
        if(!/[A-Z]/.test(password)){
            setStatus({type:"error",message:"Password must contain at least one uppercase letter."})
            return false
        }
        if(!/[0-9]/.test(password)){
            setStatus({type:"error",message:"Password must contain at least one number."})
            return false
        }
        if(currentState === "Sign Up" && data.password !== data.confirmPassword){
            setStatus({type:"error",message:"Passwords do not match."})
            return false
        }
        return true
    }

    const onLoginHandler = async (e)=>{
        e.preventDefault()
        if(!validateForm()) return
        setSubmitting(true)
        let newUrl;
        if(currentState==="Login"){
             newUrl = `${url}/api/auth/login` 
            try{
                const response = await axios.post(newUrl,data, { timeout: 10000, withCredentials: true })
                if(response.data && response.data.success){
                    setIsLoggedin(true)
                    // Refresh user role (admin/user) after login
                    userType()
                    setStatus({type:"success",message:"Login successful!"})
                    toast.success("Login successful!")
                    setTimeout(()=>{
                        setShowLogin(false)
                        navigate("/")
                    },300)
                } else {
                    const errorMsg = response.data?.message || "Login failed."
                    setStatus({type:"error",message:errorMsg})
                    toast.error(errorMsg)
                }
            }catch(error){
                let errorMessage = "Login failed. Please try again."
                
                if (error.response) {
                    // Server responded with error status
                    const status = error.response.status
                    errorMessage = error.response.data?.message || errorMessage
                    
                    // Handle specific status codes
                    if (status === 404) {
                        errorMessage = error.response.data?.message || "This user doesn't exist."
                    } else if (status === 401) {
                        errorMessage = error.response.data?.message || "Invalid password."
                    } else if (status === 403) {
                        errorMessage = error.response.data?.message || "Please verify your email first."
                    }
                } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                    errorMessage = "Request timed out. Please check your connection and try again."
                } else if (error.request) {
                    errorMessage = "No response from server. Please check your connection."
                } else {
                    errorMessage = error.message || errorMessage
                }
                
                setStatus({type:"error",message:errorMessage})
                toast.error(errorMessage)
            } finally {
                setSubmitting(false)
            }
            
        }else{
        newUrl = `${url}/api/auth/register` 
            try{
                // Increase timeout significantly to avoid client-side timeouts during testing
                const response = await axios.post(newUrl,data, { timeout: 60000 })
                if(response.data && response.data.success){
                    localStorage.setItem("registeredUserId",response.data.userId)
                    if (typeof setRegisteredUserId === "function") {
                      setRegisteredUserId(response.data.userId)
                    }
                    const successMsg = response.data.message || "Account created! Please verify your email."
                    setStatus({type:"success",message:successMsg})
                    toast.success(successMsg)
                    setTimeout(()=>{
                        setShowLogin(false)
                        navigate("/emailVerify")
                    },300)
                } else {
                    const errorMsg = response.data?.message || "Registration failed."
                    setStatus({type:"error",message:errorMsg})
                    toast.error(errorMsg)
                }
            }catch(error){
                let errorMessage = "Registration failed. Please try again."
                
                if (error.response) {
                    // Server responded with error status
                    errorMessage = error.response.data?.message || errorMessage
                    
                    // Handle validation errors
                    if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
                        errorMessage = error.response.data.errors.join(", ")
                    }
                } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                    errorMessage = "Request timed out. Please check your connection and try again."
                } else if (error.request) {
                    errorMessage = "No response from server. Please check your connection."
                } else {
                    errorMessage = error.message || errorMessage
                }
                
                setStatus({type:"error",message:errorMessage})
                toast.error(errorMessage)
            } finally {
                setSubmitting(false)
            }
    }
    }

    // Close on ESC
    useEffect(()=>{
        const onKeyDown = (e)=>{
            if(e.key === "Escape"){
                setShowLogin(false)
            }
        }
        window.addEventListener("keydown",onKeyDown)
        return ()=>window.removeEventListener("keydown",onKeyDown)
    },[setShowLogin])

    const closePopup = ()=>{
        setShowLogin(false)
        setStatus({type:null,message:""})
        setData({name:"",email:"",password:"",confirmPassword:""})
    }
   
    return(
        <div className="login-container" role="dialog" aria-modal="true" aria-label={currentState === "Login" ? "Login form" : "Sign up form"} onClick={closePopup}>
            <form className="login-form fade-in" onSubmit={onLoginHandler} onClick={e=>e.stopPropagation()}>
                <div className="form-header">
                    <h2 className="login-title">{currentState}</h2>
                    <button
                      type="button"
                      className="close-icon-btn"
                      onClick={closePopup}
                      aria-label="Close login form"
                    >
                      <img className="close-icon" src={assets.cross_icon} alt="Close"/>
                    </button>
                </div>

                {status.message && (
                  <div
                    id="login-status"
                    className={`login-notification ${status.type === "error" ? "login-notification-error" : "login-notification-success"}`}
                    role="status"
                    aria-live="polite"
                  >
                    {status.message}
                  </div>
                )}

                {currentState==="Sign Up" && (
                  <input
                    onChange={onChangeHandler}
                    name="name"
                    type="text"
                    className="form-inputs"
                    placeholder="Username"
                    value={data.name}
                    aria-invalid={status.type === "error"}
                    aria-describedby={status.message ? "login-status" : undefined}
                  />
                )}
                <input
                  onChange={onChangeHandler}
                  name="email"
                  type="email"
                  className="form-inputs"
                  placeholder="Your email"
                  value={data.email}
                  aria-invalid={status.type === "error"}
                  aria-describedby={status.message ? "login-status" : undefined}
                />
                <input
                  onChange={onChangeHandler}
                  name="password"
                  type="password"
                  className="form-inputs"
                  placeholder="Password"
                  value={data.password}
                  aria-invalid={status.type === "error"}
                  aria-describedby={status.message ? "login-status" : undefined}
                />
                {currentState === "Sign Up" && data.password && (
                  <p className="password-strength">
                    Password strength: {getPasswordStrength(data.password)}
                  </p>
                )}
                {currentState === "Sign Up" && (
                  <input
                    onChange={onChangeHandler}
                    name="confirmPassword"
                    type="password"
                    className="form-inputs"
                    placeholder="Confirm Password"
                    value={data.confirmPassword}
                    aria-invalid={status.type === "error"}
                    aria-describedby={status.message ? "login-status" : undefined}
                  />
                )}
                {currentState==="Login" && 
                <p
                  onClick={() => {setShowLogin(false);navigate("/resetPassword")}}
                  className="forget-password-text"
                >
                  Forgot password?
                </p>
                }
                
                <button
                  type="submit"
                  className="login-form-btn"
                  disabled={submitting}
                  aria-busy={submitting}
                  aria-describedby={status.message ? "login-status" : undefined}
                >
                  {submitting ? (currentState==="Login" ? "Logging in..." : "Creating account...") : currentState}
                </button>
                
                {currentState==="Login"?
                <p className="login-signup-text">
                  Create a new account?
                  <span onClick={()=>setCurrentState("Sign Up")}> Click here</span>
                </p>
                :
                <p className="login-signup-text">
                  Already have an account?
                  <span onClick={()=>setCurrentState("Login")}> Login here</span>
                </p>}
                
            </form>
        </div>
    )
}
export default LoginPopUp;