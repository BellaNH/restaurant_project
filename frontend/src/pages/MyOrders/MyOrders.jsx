import "./MyOrders.css"
import { useGlobalContext } from "../../Context/Context"
import { assets } from "../../assets/frontend_assets/assets"
import axios from "axios"
import { useEffect, useState } from "react"

const MyOrders = ()=>{
    const {url,token} = useGlobalContext()
    const [orders,setOrders] = useState([])
    const fetchOrders = async ()=>{
        const response = await axios.post(`${url}/api/order/myorders`,{},
                {headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`
                }})
                console.log(response)
            if(response.data.success){
                setOrders(response.data.data)
            }
             
    }

    useEffect(()=>{
        if(localStorage.getItem("token")){
          fetchOrders()
        }
        },[])
        useEffect(()=>{console.log(orders)},[orders])

    return(
       <div className="my-orders-container">
        <h3 className="my-orders-title">My Orders</h3>
        <div className="my-orders-table">
            {orders && orders.map((order,index)=>{
                return (
                    <div key={index} className="my-orders-row">
                    <img src={assets.parcel_icon} alt="" className="my-orders-row-img"/>
                    <p className="my-orders-row-text order-items">{order.items.map((item,index)=>{
                        return (index===order.items.length-1?item.name+"*"+item.quantity:item.name+"*"+item.quantity+",")
                    })}</p>
                    <p className="my-orders-row-text order-price">{order.amount} $</p>
                    <p className="my-orders-row-text">Items: {order.items.length}</p>
                    <button className="my-orders-row-btn">{order.status}</button>
            </div>
                )
            })}
            
        </div>
       </div>
    )
}
export default MyOrders;