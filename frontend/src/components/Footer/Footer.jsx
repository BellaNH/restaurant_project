import "./Footer.css"
import { assets } from "../../assets/frontend_assets/assets"
import { useGlobalContext } from "../../Context/Context"

const Footer = ()=>{
    const {isAdmin} = useGlobalContext()
    return(
        <footer className={isAdmin ? "admin_footer":"footer"} id="footer">
            <div className="footer-content">
                <div className="left">
                    <img src={assets.restaurant_logo} className="footer-left-logo" alt=""/>
                    <p className="left-footer-text"> Welcome to Restaurant — where fresh ingredients meet passion. 
        We pride ourselves on serving authentic dishes prepared daily 
        with love and care for every guest. Come taste the difference!</p>
                </div>
                <div className="center">
                    <h3 className="footer-title">COMPANY</h3>
                    <ul>
                        <li>Home</li>
                        <li>About us</li>
                    </ul>
                </div>
                <div className="right">
                    <p className="right-footer-text">📍 123 Flavor Street, Food City</p>
                    <p className="right-footer-text">📞 +1 (555) 123-4567</p>
                    <p className="right-footer-text">📧 info@gourmethaven.com</p>
                </div>
            </div>
        <hr/>
        <p className="copyright">Copyright 2024 @ Restaurant- All Right Reserved</p>
        </footer>
    )
}
export default Footer