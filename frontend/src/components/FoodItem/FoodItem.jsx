import "./FoodItem.css"
import { assets } from "../../assets/frontend_assets/assets"
import { memo } from "react"
import { useGlobalContext } from "../../Context/Context"

const FoodItem = memo(({ item }) => {
  const { _id, name, image, price, description } = item;
  const { cardItems, addtocart, removefromcard, url, isLoggedin } =
    useGlobalContext();
  return (
    <div className="item-container">
        <div className="img-container">
        <img src={`${url}/images/${image}`} className="item-img" alt={name} />
        {isLoggedin &&
          (!cardItems[_id] ? (
            <img
              onClick={() => addtocart(_id)}
              src={assets.add_icon_white}
              className="add-item-icon"
              alt="add item"
            />
          ) : (
          <div className="item-counter">
              <img
                onClick={() => removefromcard(_id)}
                src={assets.remove_icon_red}
                className="remove-item-counter"
                alt="remove item"
              />
            <p className="counter-display">{cardItems[_id]}</p>
              <img
                onClick={() => addtocart(_id)}
                src={assets.add_icon_green}
                className="add-item-counter"
                alt="add item"
              />
            </div>
          ))}
        </div>
        <div className="item-infos">
            <div className="item-name-rate">
                <h4 className="item-name">{name}</h4>
            </div>
            <p className="item-desc">{description}</p>
            <p className="item-price">${price}</p>
        </div>
    </div>
  );
});
export default FoodItem;