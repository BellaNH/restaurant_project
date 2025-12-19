import "./MyOrders.css"
import { useGlobalContext } from "../../Context/Context"
import { assets } from "../../assets/frontend_assets/assets"
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

const MyOrders = ()=>{
    const {url, isLoggedin} = useGlobalContext()
    const [orders,setOrders] = useState([])
    const [loading,setLoading] = useState(false)
    const fetchOrders = async ()=>{
        setLoading(true)
        try{
            const response = await axios.post(`${url}/api/order/myorders`,{})
                if(response.data.success){
                    setOrders(response.data.data)
                } else {
                    toast.error(response.data.message || "Could not load orders")
                }
        }catch(error){
            toast.error("Unable to load your orders")
        } finally {
            setLoading(false)
        }
    }

    useEffect(()=>{
        if(isLoggedin){
          fetchOrders()
        }
        },[isLoggedin])

    const isEmpty = !loading && (!orders || orders.length===0)

    return(
       <div className="my-orders-container">
        <h3 className="my-orders-title">My Orders</h3>
        <div className="my-orders-table">
            {loading && <p className="my-orders-loading">Loading your orders...</p>}
            {isEmpty && <p className="my-orders-empty">You have no orders yet.</p>}
            {!loading && orders && orders.map((order,index)=>{
                return (
                    <div key={index} className="my-orders-row">
                    <img src={assets.parcel_icon} alt="" className="my-orders-row-img"/>
                    <p className="my-orders-row-text order-items">{order.items.map((item,index)=>{
                        return (index===order.items.length-1?`${item.name} x${item.quantity}`:`${item.name} x${item.quantity}, `)
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