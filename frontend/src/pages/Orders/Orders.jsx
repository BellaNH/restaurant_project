import { useState } from "react"
import "./Orders.css"
import axios from "axios"
import { useEffect } from "react"
import { assets } from "../../assets/frontend_assets/assets"
function Orders() {
  const [data,setData] = useState([])
  const fetchallorders = async ()=>{
    const response  = await axios.post(`https://restaurant-project-ek2l.onrender.com/api/order/allorders`,{},
      {
        headers:{
          Authorization :`Bearer ${localStorage.getItem("token")}`
        }
      }
    )
    if(response.data.success){
       setData(response.data.data)
    }
  }
  const onChangeHandler = async (e,orderId)=>{
    const status = e.target.value
    const response = await axios.post(`https://restaurant-project-ek2l.onrender.com/api/order/status`,{orderId,status:status},
      {headers:{
        Authorization:`Bearer ${localStorage.getItem("token")}`
      }})
      console.log(response)
    if(response.data.success){
      fetchallorders()
    }
  }
  useEffect(()=>{
    fetchallorders()
  },[data])
  return (

    <div className="orders-table"> 
    <h3 className="item-list-title">Orders</h3>
      {data.map((order,index)=>{
        return (
        <div key={index} className="orders-table-row">
          <img src={assets.parcel_icon} alt="order" className="orders-table-row-img"/>
          <div className="order-infos-container">
            <div className="orders-table-row-container">
               <p className="orders-table-row-container-name">Items</p>
                <p className="orders-table-row-text">{order.items.map((item,index)=>{
                  return (index===order.items.length-1?
                    item.name+"*"+item.quantity:item.name+"*"+item.quantity+",")})}
                </p>
          </div> 
          <div className="orders-table-row-container">
               <p className="orders-table-row-container-name">Client</p>
            <p className="orders-table-row-text">{order.adress.firstname} {order.adress.lastname}</p>
          </div>
          <div className="orders-table-row-container">
               <p className="orders-table-row-container-name">Location</p>
            <p className="orders-table-row-text">{order.adress.street} {order.adress.city}</p>
          </div>
          <div className="orders-table-row-container">
               <p className="orders-table-row-container-name">State</p>
            <p className="orders-table-row-text">{order.adress.state}</p>
          </div>
          <div className="orders-table-row-container">
               <p className="orders-table-row-container-name">Adress</p>
            <p className="orders-table-row-text">{order.adress.zipcode} {order.adress.adress}</p>
          </div>
          <div className="orders-table-row-container">
               <p className="orders-table-row-container-name">Phone</p>
            <p className="orders-table-row-text">{order.adress.phone}</p>
          </div>
          </div> 
            <p className="orders-table-row-column">Items:{order.items.length}</p>
            <p className="orders-table-row-column">Amount:{order.amount} $</p>
            <select className="orders-table-row-select" onChange={(e)=>onChangeHandler(e,order._id)} value={order.status}>
              <option className="orders-table-row-select-option">Order processing</option>
              <option className="orders-table-row-select-option">Out for delivery</option>
              <option className="orders-table-row-select-option">Delivered</option>
            </select>          
        </div>      
      )
      })}
      

    </div>
  )
}

export default Orders