import React, { useEffect, useState, Suspense, lazy } from 'react'
import NavBar from './components/NavBar/NavBar'
import {Routes , Route} from 'react-router-dom'
import Footer from './components/Footer/Footer'
import LoginPopUp from './components/LoginPopUp/LoginPopUp'
import SideBar from "./components/SideBar/SideBar"
import { useGlobalContext } from './Context/Context'

const Home = lazy(()=>import('./pages/Home/Home'))
const Card = lazy(()=>import('./pages/Card/Card'))
const Placeorder = lazy(()=>import('./pages/Placeorder/Placeorder'))
const Verifyorder = lazy(()=>import('./pages/Verifyorder/Verifyorder'))
const MyOrders = lazy(()=>import('./pages/MyOrders/MyOrders'))
const ItemsList = lazy(()=>import('./pages/ItemsList/ItemsList'))
const AddItem = lazy(()=>import('./pages/AddItem/AddItem'))
const Orders = lazy(()=>import('./pages/Orders/Orders'))
const CategList = lazy(()=>import('./pages/CategList/CategList'))
const EmailVerify = lazy(()=>import('./pages/EmailVerify'))
const ResetPassword = lazy(()=>import('./pages/ResetPassword'))

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
      <div className={JSON.parse(localStorage.getItem("isAdmin"))?"admin-app":"app"}>
        <NavBar showLogin={showLogin} setShowLogin={setShowLogin}/>
        {JSON.parse(localStorage.getItem("isAdmin")) && <SideBar/>}
        <Suspense fallback={<div style={{padding:"2rem"}}>Loading...</div>}>
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
        </Suspense>
        <Footer/>
      </div>
      
      
    </>
  )
}

export default App;


