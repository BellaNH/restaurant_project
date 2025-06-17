import "./LoginPopUp.css"
import { assets } from "../../assets/frontend_assets/assets"
import { useEffect, useState } from "react"
import { useGlobalContext } from "../../Context/Context"
import axios from "axios"
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom"

const LoginPopUp = ({showLogin,setShowLogin})=>{
    const {registeredUserId,setRegisteredUserId,url,token,setToken,setIsLoggedin,getUserData} =useGlobalContext()
    const [currentState,setCurrentState] = useState("Login")
    const navigate = useNavigate()
    const [data,setData]= useState({
        name:"",
        email:"",
        passwod:""
    })
    const onChangeHandler = (e)=>{
        const name = e.target.name
        const value = e.target.value   
        setData({...data,[name]:value})
    }
    const onLoginHandler = async (e)=>{
        e.preventDefault()
        let newUrl;
        if(currentState==="Login"){
             newUrl = `${url}/api/auth/login` 
            try{
                if(newUrl){
                const response = await axios.post(newUrl,data)
                console.log(response)
                
                if(response.data.success){
                    localStorage.setItem("token",response.data.token)
                    setShowLogin(false)
                    
                    navigate("/")

                }
            }
            }catch(error){
                console.log(error)
            }
            
        }else{
        newUrl = `${url}/api/auth/register` 
            try{
                if(newUrl){
                const response = await axios.post(newUrl,data)
                console.log(response)
                
                if(response.data.success){
                    setShowLogin(false)
                    localStorage.setItem("registeredUserId",response.data.userId)
                    navigate("/emailVerify")
                }
            }
            }catch(error){
                console.log(error)
            }

    }
    }
   
    return(
        <div className="login-container">
            <form className="login-form" onSubmit={onLoginHandler}>
                <div className="form-header">
                <h2 className="login-title">{currentState}</h2>
                <img onClick={()=>setShowLogin(false)} className="close-icon" src={assets.cross_icon}/>
                </div>
                {currentState==="Sign Up"?<input onChange={onChangeHandler} name="name" type="text" className="form-inputs" placeholder="Username"/>:<></>}
                <input onChange={onChangeHandler} name="email" type="email" className="form-inputs" placeholder="Your email"/>
                <input onChange={onChangeHandler} name="password" type="password" className="form-inputs" placeholder="Password"/>
                <p
            onClick={() => {setShowLogin(false),navigate("/resetPassword")}}
            className="forget-password-text"
            >
            Forgot password?
            </p>
            {currentState==="Login"?
            <button type="submit" className="login-form-btn">Login</button>
            :<button type="submit" className="login-form-btn">Sign Up</button>}
                
                {currentState==="Login"?
                <p className="login-signup-text">Create a new account?<span onClick={()=>setCurrentState("Sign Up")}> Click here</span></p>
                :<p className="login-signup-text">Already have an account?<span onClick={()=>setCurrentState("Login")}> Login here</span></p>}
                
            </form>
        </div>
    )
}
export default LoginPopUp;