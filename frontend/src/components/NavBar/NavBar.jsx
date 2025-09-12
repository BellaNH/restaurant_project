import "./NavBar.css"
import { assets } from "../../assets/frontend_assets/assets"
import { useState , useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useGlobalContext } from "../../Context/Context"
import { RiMenuLine } from "react-icons/ri";
import { HashLink } from "react-router-hash-link"

const NavBar = ({showLogin,setShowLogin})=> {
    const [menu,setMenu] = useState("")  
    const {token,setToken} = useGlobalContext()
    const [showDropDownMenu,setShowDropDownMenu] = useState(false)
    const [openSideBar,setOpenSideBar] = useState(false)
    const navigate = useNavigate()
    const logout = ()=>{
        localStorage.removeItem("token")
        localStorage.removeItem("isAdmin")
        setToken("")
        navigate("/")
    }
    useEffect(()=>{
        console.log(openSideBar)
        console.log(showLogin)
    },[openSideBar,showLogin])

    return(    
    <div className="navbar">
    <Link to="/" className="logo">
    <img src={assets.restaurant_logo} alt="" className="navbar-logo-img"/>
    </Link>
    <div className="nav-links">
        <Link to="/"  className={menu==="home"?"active-link":""}>Home</Link>
        <HashLink smooth to="/#menu"  className={menu==="menu"?"active-link":""}>Menu</HashLink>
        <HashLink smooth to="#footer" className={menu==="contact us"?"active-link":""}>Contact</HashLink>
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
    <RiMenuLine 
        onClick={() => setOpenSideBar(!openSideBar)} 
        className="nav-sidebar-menu-icon"
      /> 
   
     <div
    className={`nav-sidebar sidebar-overlay ${openSideBar ? "show" : "hide"}`}>
       <button 
         onClick={() => setOpenSideBar(false)} 
         className="sidebar-close-icon"
       >
         ✕
       </button>
        <HashLink smooth to="#" onClick={() => setOpenSideBar(false)}>Home</HashLink>
       <HashLink smooth to="/#menu" onClick={() => setOpenSideBar(false)}>Menu</HashLink>
       <HashLink smooth to="#footer" onClick={() => setOpenSideBar(false)}>Contact</HashLink>
       {
        localStorage.getItem("token") && (
            <Link smooth to="/card">Card</Link>
        )      
       }
       {
        localStorage.getItem("token") && (
            <Link to="/myorders">My orders</Link>
        )      
       }
       {localStorage.getItem("token") ? 
       <button onClick={()=>{logout(),setOpenSideBar(false)}} className="sidebar-logout-btn">Log Out</button>
       :<button onClick={()=>{setShowLogin(true),setOpenSideBar(false)}} className="sidebar-signup-btn">sign up</button>}
       
     </div>
     
     
     
       
    </div>)
}
export default NavBar;