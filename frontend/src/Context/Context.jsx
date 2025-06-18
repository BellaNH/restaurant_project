import { createContext, useContext, useEffect, useState } from "react";
import { food_list } from "../assets/frontend_assets/assets"
import axios from "axios"
import { toast } from "react-toastify";

const AppContext = createContext();
const AppProvider = ({ children }) => {

  const [cardItems,setCardItems] = useState({})
  const url = "https://restaurant-project-ek2l.onrender.com"
  const [list,setList] = useState([])
  const [token,setToken] = useState("")
  const [categories,setCategories] = useState([])
  const [isAdmin, setIsAdmin] = useState();

    useEffect(()=>{
        if(localStorage.getItem("token")){
        console.log(localStorage.getItem("token"))
        }
    },[])
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(false);

  const fetchCategories = async ()=>{
    try{
      const response = await axios.get("https://restaurant-project-ek2l.onrender.com/api/category/list")
      console.log(response)
      if(response.data.success){
        setCategories(response.data.data)
      }else{
        console.log(response.data.error)
      }
    }
    catch(error){
      console.log(error)
    }
  } 

  const addtocart= async (itemId)=>{
    setCardItems(!cardItems[itemId]?(prev)=>({...prev,[itemId]:1}):(prev)=>({...prev,[itemId]:prev[itemId]+1}))
    if(token){
      const response = await axios.post(`${url}/cart/add`,{itemId},
        {headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }})
    }
  
  }
  

  const removefromcard = async (itemId)=>{
    setCardItems(prev=>  
      prev[itemId]>1?
      {...prev,[itemId]:prev[itemId]-1}:
      (()=>{
        const {[itemId]: _, ...rest} = prev;
        return rest;
    })()
  
  )
  if(token){
    const response = await axios.post(`${url}/cart/remove`,{itemId},{headers:{Authorization:token}})
  }
}
  const fetchCartItems = async ()=>{
      const response = await axios.post(`${url}/cart/get`,{},
        {headers:
          {Authorization:`Bearer ${localStorage.getItem("token")}`}})
      console.log(response.data)
      response.data.success?setCardItems(response.data.data):setCardItems({})
  }
  
  const fetchList = async ()=>{
    const response = await axios.get(`${url}/api/food/list`)
    console.log(response.data)
    if(response.data.success){
      setList(response.data.data)
    }
  }
  const getTotalAmount = ()=>{
    let totalAmount = 0;
    for(const item in cardItems){
      const food_item = list.find((product)=>(product._id===item))
      totalAmount = totalAmount + food_item.price*cardItems[item]
    }
    return totalAmount
  }
  const userType = async ()=>{
    try{
      const data = await axios.post(`https://restaurant-project-ek2l.onrender.com/api/user/role`,{},
        {headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }}
      )
      console.log(data.data)
      setIsAdmin(data.data.isAdmin)
    }
    catch(error){
      console.log(error)
    }
  }
  useEffect(()=>{
    const loadData = async ()=>{ 
      await fetchList() 
      if(localStorage.getItem("token")){
       
        setToken(localStorage.getItem("token"))
        await fetchCartItems(localStorage.getItem("token"))
    }      
    }  
    console.log(cardItems)
    console.log(`${url}/cart/get`)
     userType()
    loadData()
    fetchCategories()
  },[])
  
  useEffect(()=>{console.log(localStorage.getItem("registeredUserId"))},[localStorage.getItem("registeredUserId")])
  useEffect(()=>{console.log(localStorage.getItem("token"))},[localStorage.getItem("token")])

  useEffect(()=>{
    console.log(isAdmin)
  },[isAdmin])
return (
    <AppContext.Provider value={{
      food_list,
      cardItems,
      setCardItems,
      addtocart,
      removefromcard,
      getTotalAmount,
      url,
      token,
      setToken,
      list,
      fetchList,
      fetchCategories,
      categories,
      setCategories,
      isLoggedin,
      setIsLoggedin,
      userData,
      setUserData,
      isAdmin, 
      setIsAdmin,
      userType,
      setList}}> 
      {children}
    </AppContext.Provider>
  );
};
export const useGlobalContext = () => {
  return useContext(AppContext);
};
export { AppContext, AppProvider };
