import "./NavBar.css";
import { assets } from "../../assets/frontend_assets/assets";
import { useState , useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGlobalContext } from "../../Context/Context";
import { RiMenuLine } from "react-icons/ri";
import { HashLink } from "react-router-hash-link";
import axios from "axios";

const NavBar = ({showLogin,setShowLogin})=> {
    const [menu,setMenu] = useState("")  
    const {url, isLoggedin, setIsLoggedin, setIsAdmin} = useGlobalContext()
    const [showDropDownMenu,setShowDropDownMenu] = useState(false)
    const [openSideBar,setOpenSideBar] = useState(false)
    const navigate = useNavigate()
    const logout = async ()=>{
        try {
          await axios.post(`${url}/api/auth/logout`, {}, { withCredentials: true });
        } catch (e) {
          // ignore logout errors, still clear client state
        }
        localStorage.removeItem("isAdmin")
        setIsLoggedin(false)
        setIsAdmin(false)
        navigate("/")
    }
    useEffect(()=>{
        console.log(openSideBar)
        console.log(showLogin)
    },[openSideBar,showLogin])

    return(    
    <div className="navbar">
    <Link to="/" className="logo" aria-label="Go to home">
    <img src={assets.restaurant_logo} alt="Restaurant logo" className="navbar-logo-img"/>
    </Link>
    <div className="nav-links">
        <Link to="/"  className={menu==="home"?"active-link":""}>Home</Link>
        <HashLink smooth to="/#menu"  className={menu==="menu"?"active-link":""}>Menu</HashLink>
        <HashLink smooth to="#footer" className={menu==="contact us"?"active-link":""}>Contact</HashLink>
    </div>  
    {isLoggedin
    ?<div className="right-navbar">
        <div className="basket-icon-container">
            <Link to="/card" aria-label="View cart">
            <img className="basket-icon" src={assets.basket_icon} alt="Cart"/></Link>
            <div className="dot"></div>  
        </div>   
        <div className="profile-drop-down-container">
            <button
              aria-label="Profile menu"
              aria-expanded={showDropDownMenu}
              className="profile-button"
              onClick={()=>setShowDropDownMenu(!showDropDownMenu)}
            >
              <img src={assets.profile_icon} className="navbar-profile-pic" alt="Profile"/>
            </button>
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
    <RiMenuLine 
        onClick={() => setOpenSideBar(!openSideBar)} 
        className="nav-sidebar-menu-icon"
      /> 
   
     <div
    className={`nav-sidebar sidebar-overlay ${openSideBar ? "show" : "hide"}`}>
      <button 
        onClick={() => setOpenSideBar(false)} 
        className="sidebar-close-icon"
        aria-label="Close menu"
      >
        ✕
      </button>
        <HashLink smooth to="#" onClick={() => setOpenSideBar(false)}>Home</HashLink>
       <HashLink smooth to="/#menu" onClick={() => setOpenSideBar(false)}>Menu</HashLink>
       <HashLink smooth to="#footer" onClick={() => setOpenSideBar(false)}>Contact</HashLink>
       {
        isLoggedin && (
            <Link smooth="true" to="/card">Card</Link>
        )      
       }
       {
        isLoggedin && (
            <Link to="/myorders">My orders</Link>
        )      
       }
       {isLoggedin ? 
       <button onClick={()=>{logout();setOpenSideBar(false)}} className="sidebar-logout-btn">Log Out</button>
       :<button onClick={()=>{setShowLogin(true);setOpenSideBar(false)}} className="sidebar-signup-btn">sign up</button>}
       
     </div>
     
     
     
       
    </div>)
}
export default NavBar;