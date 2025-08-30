import React from 'react'
import { useState ,useEffect} from 'react'
import "./CategList.css"
import {assets} from "../../assets/frontend_assets/assets"
import axios from 'axios';
import {toast} from "react-toastify"
import { useGlobalContext } from '../../Context/Context';

function CategList() {
    const [editedCategId,setEditedCategId] = useState("")
  const [editedFoodItem,setEditedFoodItem] = useState()
  const [openEditForm,setOpenEditForm]= useState(false)
  const {fetchCategories,categories} = useGlobalContext()
  const [data,setData] = useState({
    id:"",
    name:"",
    image:""
  })

  
 

  const removeItem = async (itemId)=>{
    const response = await axios.post(`http://localhost:4000/api/category/removeCategory`,{id:itemId},
        {headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
        }}
    )
    if(response.data.success){
      toast.success(response.data.message)
      fetchCategories()
    }else{
      toast.error(response.data.message)
    }
  }
  
  const fetchEditedCateg = async (foodId)=>{

    console.log(foodId)
    try{
      const response = await axios.get(`http://localhost:4000/api/category/fetchEditedCateg?id=${foodId}`,
        {
            headers:{
                Authorization:`Bearer ${localStorage.getItem("token")}`
            }
        }
      )
      console.log(response)
      setData(
        {
          id:response.data.data._id,
          name:response.data.data.name,
          image:response.data.data.image,
        }
      )
    }
    catch(error){
     console.log(error)
    }
  }



const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append("id", data.id);
    formData.append("name", data.name);

    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else {
      formData.append("imageFilename", data.image);
    }

    const response = await axios.post("http://localhost:4000/api/category/editCategory", formData,
        {
            headers:{
                Authorization:`Bearer ${localStorage.getItem("token")}`
            }
        }
    );
    console.log(response.data);
    setOpenEditForm(false);
    fetchCategories()
  } catch (error) {
    console.log(error);
  }
};

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setData((prev) => ({ ...prev, image: file }));
  }
};


  const handleChange = (e)=>{
    const {name,value} = e.target
    setData({...data,[name]:value})
  }

  useEffect(()=>{console.log(data)},[data])
 const handleClickEdit = async (id)=>{
  await fetchEditedCateg(id)
  setOpenEditForm(true)
  setEditedCategId(id)
 }
  return (
   <div className="item-list-container"> 
      <h3 className='item-list-title'>Category List</h3>
      <div className="item-list-table">
        <div className="item-list-header category-list-row">
          <p>Image</p>
          <p>Name</p>
          <p className='category-act-header act-header'>Actions</p>
        </div>
        {categories && categories.map((item,index)=>{
          return (
          <div className="item-list-element category-list-row" key={index}>
            <img className='item-list-element-img' src={`http://localhost:4000/images/${item.image}`}/>
            <p>{item.name}</p>
              <div className='category-act-btn-container'>
              <button type='button' className='category-act-btn act-btn-delete' onClick={()=>{removeItem(item._id)}}>Remove</button>
              <button type='button' className='category-act-btn act-btn-edit' onClick={()=>handleClickEdit(item._id)}>Edit</button>
            </div>
            {openEditForm && 
              String(editedCategId) === String(item._id) && (
   <form onSubmit={handleSubmit} className="category-add-form">
    <p className="add-category-text">Upload Image</p>
          <label htmlFor="file-upload" className="item-img-wrapper">
      <img
         src={data.image instanceof File 
        ? URL.createObjectURL(data.image)
        : `http://localhost:4000/images/${data.image}`}
        className="food-item-img"
        alt="Food"
      />
      <input
        type="file"
        id="file-upload"
        className="file-input"
        onChange={handleImageChange}
        accept="image/*"
      />
      <span className="upload-overlay">Click to change image</span>
    </label>

      <p className='item-info-label'>Name</p>
      <input
        name="name" onChange={handleChange}
        className="item-input"
        value={data.name}
        placeholder="Food Name"
      />
    <div className="act-item-btn-container">
      <button type='button' className="act-item-btn cancel-btn" onClick={()=>setOpenEditForm(false)}>Cancel</button>
      <button type='submit' className="act-item-btn edit-btn">Edit</button>
    </div>
   

  </form>
)}
          </div>)
          
        })}
              
        
      </div>





      
    </div>
  )
}

export default CategList