import "./AddItem.css"
import {assets} from "../../assets/admin_assets/admin_assests"
import { useState } from "react";
import axios from "axios";
import {toast} from "react-toastify";
import { useEffect } from "react";
import {menu_list} from "../../assets/frontend_assets/assets"

function AddItem({url}) {
  const [image,setImage]= useState(null)
  const [data,setData]= useState({
    name:"",
    description:"",
    category:"Salad",
    price:"",
  })

  
  const onChangeHandler = (e)=>{
    const name = e.target.name;
    const value = e.target.value;
    setData((data)=>({...data,[name]:value}))
    console.log(data)
  }
  const onSubmitHandler = async (e)=>{
    e.preventDefault();
    const formData = new FormData();
    formData.append("name",data.name);
    formData.append("description",data.description);
    formData.append("category",data.category);
    formData.append("price",Number(data.price));
    formData.append("image",image);
    const response = await axios.post(`http://localhost:4000/api/food/add`,formData);
    if(response.data.success){
      setData({
        name:"",
        description:"",
        category:"",
        price:"",
      })
      setImage(null)
      toast.success(response.data.message)
    }else{
      toast.error(response.data.message)
    }
  }
  return (
    <form className="AddItem" onSubmit={onSubmitHandler}> 
     <div className="flex-col">
      <p className="add-item-text">Upload Image</p>
      <div className="upload-img-form">
        <label htmlFor="image">
          <img src={image?URL.createObjectURL(image):assets.upload_area} className="upload-img"/>
        </label>
        <input onChange={(e)=>(setImage(e.target.files[0]))} type="file" id="image" hidden required/>

      </div>
     </div>
     <div className="flex-col">
      <p className="add-item-text">Product name</p>
      <input value={data.name} onChange={onChangeHandler} type="text" name="name" placeholder="Type here" className="flex-col-input"/>
     </div>
     <div className="flex-col">
      <p className="add-item-text">Product description</p>
      <textarea value={data.description} onChange={onChangeHandler} name="description" rows="6" placeholder="write content here" className="food-desc-input"/>
     </div>
     <div className="item-info-container">
      <div className="flex-col category-container">
        <p className="add-item-text">Product category</p>
        <select value={data.category} onChange={onChangeHandler} name="category" className="flex-col-input">
          {menu_list.map((item,index)=>{  
            return <option key={index} value={item.menu_name}>{item.menu_name}</option>
          })}
        </select>
      </div>
      <div className="flex-col price-container">
        <p className="add-item-text">Product price</p>
        <input value={data.price} onChange={onChangeHandler} type="Number" name="price" placeholder="$25" className="flex-col-input"/>
      </div>
     </div>
     <button type="submit" className="add-item-btn">ADD</button>
    </form>
  )
}

export default AddItem;