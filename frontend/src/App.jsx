import React, { useEffect, useState } from 'react'
import NavBar from './components/NavBar/NavBar'
import {Routes , Route} from 'react-router-dom'
import Home from './pages/Home/Home'
import Card from './pages/Card/Card'
import Placeorder from './pages/Placeorder/Placeorder'
import Footer from './components/Footer/Footer'
import LoginPopUp from './components/LoginPopUp/LoginPopUp'
import Verifyorder from './pages/Verifyorder/Verifyorder'
import MyOrders from './pages/MyOrders/MyOrders'
import ItemsList from './pages/ItemsList/ItemsList'
import AddItem from './pages/AddItem/AddItem'
import Orders from './pages/Orders/Orders'
import CategList from './pages/CategList/CategList'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import SideBar from "./components/SideBar/SideBar"
import { useGlobalContext } from './Context/Context'
function App() {
  const [showLogin,setShowLogin] = useState(false)
  const {isAdmin, setIsAdmin,userType} = useGlobalContext()


  useEffect(() => {
  if (showLogin) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }


  return () => {
    document.body.style.overflow = 'auto';
  };
}, [showLogin]);




  return (
    <>
      {showLogin?<LoginPopUp showLogin={showLogin} setShowLogin={setShowLogin}/>:<></>}
      <div className={isAdmin?"admin-app":"app"}>
        <NavBar showLogin={showLogin} setShowLogin={setShowLogin}/>
        {isAdmin && <SideBar/>}
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/card" element={<Card/>}/>
          <Route path="/placeorder" element={<Placeorder/>}/>
          <Route path="/verifyorder" element={<Verifyorder/>}/>
          <Route path="/myorders" element={<MyOrders/>}/>
          <Route path="/emailVerify" element={<EmailVerify/>} />
          <Route path="/resetPassword" element={<ResetPassword/>} />
          {isAdmin &&
          <Route path="/list" element={<ItemsList/>}/>
          }
          {isAdmin &&
          <Route path="/Orders" element={<Orders/>} />
          }
          {isAdmin &&
          <Route path="/categorylist" element={<CategList/>} />
          }
          {isAdmin &&
          <Route path="/add" element={<AddItem/>}/>
          }   
        </Routes>
        <Footer/>
      </div>
      
      
    </>
  )
}

export default App;


