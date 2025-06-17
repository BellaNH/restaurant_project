import "./SideBar.css"
import {assets} from "../../assets/admin_assets/admin_assests"
import {NavLink} from "react-router-dom"
import { useEffect } from "react";
import { MdAdd } from "react-icons/md";
import { IoFastFoodOutline } from "react-icons/io5";
import { MdRestaurantMenu } from "react-icons/md";
import { MdOutlineDeliveryDining } from "react-icons/md";

function SideBar() {
   useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        const height = navbar.offsetHeight + 'px';
        document.documentElement.style.setProperty('--navbar-height', height);
      }
    };

    updateNavbarHeight(); // run once

    window.addEventListener('resize', updateNavbarHeight);
    return () => {
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, []);

  return (
    <div className="sidebar"> 
    <p className="Admin-panel-title">Admin Panel</p>
      <div className="options">
        <NavLink to="/add" className="option">
          <MdAdd className="sidebar-add-icon"/>
          <p className="option-text">Add Food</p>
        </NavLink>
        <NavLink to="/List" className="option">
          <IoFastFoodOutline className="sidebar-food-icon"/>
          <p className="option-text">Food List</p>
        </NavLink>
        <NavLink to="/categorylist" className="option">
          <MdRestaurantMenu className="sidebar-food-icon"/>
          <p className="option-text">Category list</p>
        </NavLink>
        <NavLink to="/Orders" className="option">
          <MdOutlineDeliveryDining className="sidebar-add-icon"/>
          <p className="option-text">Orders</p>
        </NavLink>
      </div>
    </div>
  )
}

export default SideBar;