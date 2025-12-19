import "./Card.css"
import { useGlobalContext } from "../../Context/Context"
import { Navigate, useNavigate } from "react-router-dom"
import { useMemo } from "react"

const DELIVERY_FEE = 2;
const Card = ()=> {
  const {cardItems,removefromcard,getTotalAmount,list,listLoading,cartLoading} =useGlobalContext()
  const navigate= useNavigate()
  const cartEntries = useMemo(()=>{
    if(!list || list.length===0) return [];
    return list.filter(item=>cardItems[item._id]).map(item=>({
      ...item,
      quantity: cardItems[item._id]
    }));
  },[list,cardItems])

  const isEmpty = !cartEntries.length;
  const isLoading = listLoading || cartLoading;
    return(
    <div className="card">
      <div className="card-list-container">
            <ul className="card-list-header">
                <li>Items</li>
                <li>Title</li>
                <li>Price</li>
                <li>Quantity</li>
                <li>Total</li>
                <li>Remove</li>
            </ul>
            {isLoading && <p className="card-loading">Loading your cart...</p>}
            {!isLoading && isEmpty && <p className="card-empty">Your cart is empty. Add some items to get started.</p>}
            {!isLoading && cartEntries.map((item,index)=>(
              <div key={index}>
                <div className="card-list-header card-list-item" >
                  <img className="card-list-item-img" alt="" src={`${import.meta.env.VITE_API_URL || ""}/images/${item.image}`}/>
                  <p className="card-list-item-info">{item.name}</p>
                  <p className="card-list-item-info">${item.price}</p>
                  <p className="card-list-item-info-quantity">{item.quantity}</p>
                  <p className="card-list-item-info">${item.price*item.quantity}</p>
                  <p className="card-list-item-info-remove" onClick={()=>removefromcard(item._id)}>-</p>
                </div>
                <hr/>
              </div>
            ))}
      </div>
      <div className="card-bottom">
        <div className="card-totals">
          <h3 className="card-bottom-title">Card Totals</h3>
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
          <button className="proceed-btn" disabled={isEmpty} onClick={()=>navigate("/placeorder")}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="promo-code-container">
          <p className="promo-code-text">if you have a promo code ,Enter it here</p>
          <div className="promo-code">  
          <input type="text" className="promo-code-input" placeholder="promo code"/>
          <button className="promo-code-submit-btn">Submit</button>
          </div>
        </div>
      </div>
    </div>)
}
export default Card