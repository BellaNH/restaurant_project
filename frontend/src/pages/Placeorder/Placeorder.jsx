import "./Placeorder.css"
import { useGlobalContext } from "../../Context/Context"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
const  Placeorder = ()=>{
    const {cardItems,getTotalAmount,url,list,token} =useGlobalContext()
    const navigate = useNavigate()
    const [data,setData] = useState({
      firstname:"",
      lastname:"",
      email:"",
      city:"",
      street:"",
      state:"",
      country:"",
      zipcode:"",
      phone:"",
      adress:"",
    })
    const onChangeHandler = (e)=>{
      const name= e.target.name
      const value = e.target.value
      setData({...data,[name]:value})
    }
    const onSubmitHandler = async (e)=>{
      e.preventDefault()
      let orders = []
      list.map((item)=>{
        if(cardItems[item._id]>0){
          let iteminfo = item
          iteminfo["quantity"]=cardItems[item._id]
          orders.push(iteminfo)
        }
      })
      let ordersdata = {
        adress : data,
        items:orders,
        amount : getTotalAmount()+2
      }
      console.log(ordersdata)
      const response = await axios.post(
  `${url}/api/order/placeorder`,
  { ordersdata },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
);
        console.log(response.data)
        if(response.data.success){
          window.location.replace(`${response.data.success_url}`)
          
        }else{
          navigate("/")
        }
         
    }

    useEffect(()=>{
      if(!localStorage.getItem("token") || getTotalAmount===0){
        navigate("/")
      }
    },[localStorage.getItem("token")])

    useEffect(()=>{
          console.log(localStorage.getItem("token"))
    },[])

    
   
    return(
    <form onSubmit={onSubmitHandler} className="placeorder-container">
        <div className="placeorder-left">
            <h2 className="placeorder-left-title">Delivery Information</h2>
            <div className="multi-inputs">
                <input required onChange={onChangeHandler} value={data.firstname} name="firstname" type="text" className="placeorder-input" placeholder="First name"/>
                <input required onChange={onChangeHandler} value={data.lastname} name="lastname" type="text" className="placeorder-input" placeholder="Last name"/>
            </div>
            <input required onChange={onChangeHandler} value={data.email} name="email" type="text" className="placeorder-input" placeholder="Email address"/>
            <input required onChange={onChangeHandler} value={data.street} name="street" type="text" className="placeorder-input" placeholder="Street" />
            <div className="multi-inputs">
                <input required onChange={onChangeHandler} value={data.city} name="city" type="text" className="placeorder-input" placeholder="City"/>
                <input required onChange={onChangeHandler} value={data.state} name="state" type="text" className="placeorder-input" placeholder="State"/>
            </div>
            <div className="multi-inputs">
                <input required onChange={onChangeHandler} value={data.zipcode} name="zipcode" type="text" className="placeorder-input" placeholder="Zip code"/>
                <input required onChange={onChangeHandler} value={data.country} name="country" type="text" className="placeorder-input" placeholder="Country"/>
            </div>
            <input required onChange={onChangeHandler} value={data.phone} name="phone" type="text" className="placeorder-input" placeholder="Phone"/>
        </div>
        <div className="placeorder-right">
          <h3 className="placeorder-left-title">Card Totals</h3>
          <div className="card-totals-line">
            <p className="card-bottom-text">subtotal</p>
            <p className="card-bottom-text">${getTotalAmount()}</p>
          </div>
          <div className="card-totals-line">
            <p className="card-bottom-text">Delivery Fee</p>
            <p className="card-bottom-text">${getTotalAmount()===0?0:2}</p>
          </div>
          <div className="card-totals-line total">
          <p className="card-bottom-text">Total</p>
          <p className="card-bottom-text">${getTotalAmount()===0?0:getTotalAmount()+2}</p>
          </div>
          <button type="submit" className="proceed-payement-btn">Proceed To Payement</button>
        </div>
    </form>
)
} 
export default Placeorder