import "./Placeorder.css"
import { useGlobalContext } from "../../Context/Context"
import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

const DELIVERY_FEE = 2;
const  Placeorder = ()=>{
    const {cardItems,getTotalAmount,url,list,isLoggedin} =useGlobalContext()
    const navigate = useNavigate()
    const [isSubmitting,setIsSubmitting] = useState(false)
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
      address:"",
    })

    const cartEntries = useMemo(()=>{
      if(!list || list.length===0) return [];
      return list.filter(item=>cardItems[item._id]).map(item=>({
        _id:item._id,
        name:item.name,
        price:item.price,
        image:item.image,
        quantity: cardItems[item._id]
      }));
    },[list,cardItems])

    const onChangeHandler = (e)=>{
      const name= e.target.name
      const value = e.target.value
      setData({...data,[name]:value})
    }

    const validateForm = ()=>{
      if(!cartEntries.length){
        toast.error("Your cart is empty")
        return false
      }
      const requiredFields = ["firstname","lastname","email","city","street","state","country","zipcode","phone"]
      for(const field of requiredFields){
        if(!data[field] || data[field].trim()===""){
          toast.error("Please fill all delivery fields")
          return false
        }
      }
      const emailRegex = /^\S+@\S+\.\S+$/
      if(!emailRegex.test(data.email)){
        toast.error("Please enter a valid email")
        return false
      }
      return true
    }

    const onSubmitHandler = async (e)=>{
      e.preventDefault()
      if(!validateForm()) return
      setIsSubmitting(true)
      const ordersdata = {
        address : data,
        items:cartEntries,
        amount : getTotalAmount()+DELIVERY_FEE
      }
      try{
        const response = await axios.post(
          `${url}/api/order/placeorder`,
          { ordersdata }
        );
        if(response.data.success){
          toast.success("Redirecting to payment...")
          window.location.replace(`${response.data.success_url}`)
        }else{
          toast.error(response.data.message || "Could not place order")
          navigate("/")
        }
      }catch(error){
        toast.error("Unable to place order. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }

    useEffect(()=>{
      if(!isLoggedin || getTotalAmount()===0){
        navigate("/")
      }
    },[cardItems, navigate, getTotalAmount, isLoggedin])

    return(
    <form onSubmit={onSubmitHandler} className="placeorder-container">
        <div className="placeorder-left">
            <h2 className="placeorder-left-title">Delivery Information</h2>
            <div className="multi-inputs">
                <input required onChange={onChangeHandler} value={data.firstname} name="firstname" type="text" className="placeorder-input" placeholder="First name"/>
                <input required onChange={onChangeHandler} value={data.lastname} name="lastname" type="text" className="placeorder-input" placeholder="Last name"/>
            </div>
            <input required onChange={onChangeHandler} value={data.email} name="email" type="email" className="placeorder-input" placeholder="Email address"/>
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
            <p className="card-bottom-text">${getTotalAmount()===0?0:DELIVERY_FEE}</p>
          </div>
          <div className="card-totals-line total">
          <p className="card-bottom-text">Total</p>
          <p className="card-bottom-text">${getTotalAmount()===0?0:getTotalAmount()+DELIVERY_FEE}</p>
          </div>
          <button type="submit" disabled={isSubmitting} className="proceed-payement-btn">
            {isSubmitting ? "Processing..." : "Proceed To Payment"}
          </button>
        </div>
    </form>
)
} 
export default Placeorder