import "./FoodList.css"
import FoodItem from "../FoodItem/FoodItem"
import { useContext, useState } from "react"
import {useGlobalContext} from "../../Context/Context"

const FoodList = ({selectedCategory})=> {
    const {list} = useGlobalContext()
    
    return(
    <div className="foodlist-container">
        <h2 className="foodlist-title">Top dishes near you</h2>
        <div className="foodlist">
            {list.length > 0 ? (
            list.map((item,index)=>{
                if(selectedCategory==="All" || selectedCategory===item.category)
                    return <FoodItem item={item} key={index}/>
            }))
            :
            <p>Food list is loading ...</p>
        }
        </div>
    </div>
    ) 
}
export default FoodList