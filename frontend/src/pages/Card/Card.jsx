import "./Card.css"
import { useGlobalContext } from "../../Context/Context"
import { Navigate, useNavigate } from "react-router-dom"
import { food_list } from "../../assets/frontend_assets/assets"
const Card = ()=> {
  const {cardItems,removefromcard,getTotalAmount} =useGlobalContext()
  const navigate= useNavigate()
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
            {food_list.map((item,index)=>{
              if(cardItems[item._id]){
                return (
                <div key={index}>
                <div className="card-list-header card-list-item" >
                  <img className="card-list-item-img" alt="" src={item.image}/>
                  <p className="card-list-item-info">{item.name}</p>
                  <p className="card-list-item-info">${item.price}</p>
                  <p className="card-list-item-info-quantity">{cardItems[item._id]}</p>
                  <p className="card-list-item-info">${item.price*cardItems[item._id]}</p>
                  <p className="card-list-item-info-remove" onClick={()=>removefromcard(item._id)}>-</p>
                </div>
                <hr/>
                </div> )
              }

            })}
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
            <p className="card-bottom-text">${getTotalAmount()===0?0:2}</p>
          </div>
          <div className="card-totals-line total">
          <p className="card-bottom-text">Total</p>
          <p className="card-bottom-text">${getTotalAmount()===0?0:getTotalAmount()+2}</p>
          </div>
          <button className="proceed-btn" onClick={()=>navigate("/placeorder")}>PROCEED TO CHECKOUT</button>
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