import "./NavBar.css"
import { assets } from "../../assets/frontend_assets/assets"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useGlobalContext } from "../../Context/Context"
  
const NavBar = ({showLogin,setShowLogin})=> {
    const [menu,setMenu] = useState("")  
    const {token,setToken} = useGlobalContext()
    const [showDropDownMenu,setShowDropDownMenu] = useState(false)
    const navigate = useNavigate()
    const logout = ()=>{
        localStorage.removeItem("token")
        localStorage.removeItem("isAdmin")
        setToken("")
        navigate("/")
    }
    return(    
    <div className="navbar">
    <Link to="/" className="logo">
    <img src={assets.restaurant_logo} alt="" className="navbar-logo-img"/>
    </Link>
    <div className="nav-links">
        <Link to="/" onClick={()=>{setMenu("home")}} className={menu==="home"?"active-link":""}>home</Link>
        <a href="#menu" onClick={()=>{setMenu("menu")}} className={menu==="menu"?"active-link":""}>menu</a>
        <a href="#download-container" onClick={()=>{setMenu("mobile app")}} className={menu==="mobile app"?"active-link":""}>location</a>
        <a href="#footer" onClick={()=>{setMenu("contact us")}} className={menu==="contact us"?"active-link":""}>contact us</a>
    </div>  
    {localStorage.getItem("token")
    ?<div className="right-navbar">
        <div className="basket-icon-container">
            <Link to="/card">
            <img className="basket-icon" src={assets.basket_icon} alt=""/></Link>
            <div className="dot"></div>  
        </div>   
        <div className="profile-drop-down-container">
            <img onClick={()=>setShowDropDownMenu(!showDropDownMenu)} src={assets.profile_icon} className="navbar-profile-pic"/>
            {showDropDownMenu && 
            <ul className="dropdown-container">
                <li className="drop-down-element" onClick={()=>(navigate("/myorders"))}>
                    <img src={assets.bag_icon} className="drop-down-element-img"/>
                    <p>My Orders</p>
                </li>
                <hr/>
                <li className="drop-down-element">
                <img src={assets.logout_icon} className="drop-down-element-img"/>
                <p onClick={logout}>Log Out</p>
                </li>
            </ul>       
            }
            
            
         </div>

    </div> :
    <button onClick={()=>{setShowLogin(true)}} className="signup-btn">sign up</button>
    } 
         
    </div>)
}
export default NavBar;