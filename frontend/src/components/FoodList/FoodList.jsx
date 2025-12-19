import "./FoodList.css"
import FoodItem from "../FoodItem/FoodItem"
import {useGlobalContext} from "../../Context/Context"

const FoodList = ({selectedCategory})=> {
    const {list,listLoading,fetchList,listPage,listPages} = useGlobalContext()
    const filteredList = list.filter((item)=> selectedCategory==="All" || selectedCategory===item.category)
    const isEmpty = !listLoading && filteredList.length===0

    const handlePrev = ()=>{
        if(listPage>1){
            fetchList(listPage-1,true)
        }
    }
    const handleNext = ()=>{
        if(listPage<listPages){
            fetchList(listPage+1,true)
        }
    }
    return(
    <div className="foodlist-container">
        <h2 className="foodlist-title">Top dishes near you</h2>
        <div className="foodlist">
            {listLoading && <p>Loading menu...</p>}
            {isEmpty && <p>No dishes found in this category.</p>}
            {!listLoading && filteredList.map((item,index)=>(
                <FoodItem item={item} key={index}/>
            ))}
        </div>
        {listPages > 1 && (
            <div className="foodlist-pagination">
                <button disabled={listPage<=1 || listLoading} onClick={handlePrev}>Prev</button>
                <span>Page {listPage} of {listPages}</span>
                <button disabled={listPage>=listPages || listLoading} onClick={handleNext}>Next</button>
            </div>
        )}
    </div>
    ) 
}
export default FoodList