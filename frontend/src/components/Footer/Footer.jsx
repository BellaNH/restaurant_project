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
                    <p className="left-footer-text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus, maxime dicta facere eum modi dolores suscipit consectetur dolore voluptatem corrupti distinctio provident excepturi, itaque repudiandae quod non rem esse, deleniti repellat incidunt nostrum sit quidem fuga. Exercitationem animi magnam voluptates enim consequatur facere tempora? Nemo reprehenderit non totam quidem aperiam?</p>
                    <div className="social-icons">
                    <img src={assets.facebook_icon} className="f-img"/>
                    <img src={assets.twitter_icon} className="t-img"/>
                    <img src={assets.linkedin_icon} className="l-img"/>
                    </div> 
                </div>
                <div className="center">
                    <h3 className="footer-title">COMPANY</h3>
                    <ul>
                        <li>Home</li>
                        <li>About us</li>
                    </ul>
                </div>
                <div className="right">
                    <h3 className="footer-title">GET IN TOUCH</h3>
                    <p className="right-footer-text">Phone Number</p>
                    <p className="right-footer-text">Email Adress</p>
                </div>
            </div>
        <hr/>
        <p className="copyright">Copyright 2024 @ Restaurant- All Right Reserved</p>
        </footer>
    )
}
export default Footer