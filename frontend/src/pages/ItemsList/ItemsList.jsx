import { useState ,useEffect} from 'react'
import "./ItemsList.css"
import {assets} from "../../assets/frontend_assets/assets"
import axios from 'axios';
import {toast} from "react-toastify"
import { useGlobalContext } from '../../Context/Context';
function ItemsList() {

  const [editedFoodId,setEditedFoodId] = useState("")
  const [editedFoodItem,setEditedFoodItem] = useState()
  const [openEditForm,setOpenEditForm]= useState(false)
  const {fetchList,list} = useGlobalContext()
  const [data,setData] = useState({
    id:"",
    name:"",
    description:"",
    price:"",
    category:"",
    image:"",
  })

  
  useEffect(()=>{
    fetchList();
  },[])
  console.log(list)

  const removeItem = async (itemId)=>{
    const response = await axios.post(`https://restaurant-project-ek2l.onrender.com/api/food/remove`,{id:itemId})
    await fetchList()
    if(response.data.success){
      toast.success(response.data.message)
    }else{
      toast.error(response.data.message)
    }
  }
  const fetchEditedFood = async (foodId)=>{

    console.log(foodId)
    try{
      const response = await axios.get(`https://restaurant-project-ek2l.onrender.com/api/food/fetchEditedFood?id=${foodId}`)
      console.log(response)
      setData(
        {
          id:response.data.data._id,
          name:response.data.data.name,
          description:response.data.data.description,
          price:response.data.data.price,
          category:response.data.data.category,
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
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("price", data.price);

    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else {
      formData.append("imageFilename", data.image);
    }

    const response = await axios.post("https://restaurant-project-ek2l.onrender.com/api/food/edit", formData);
    console.log(response.data);
    setOpenEditForm(false);
    fetchList()
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
  await fetchEditedFood(id)
  setOpenEditForm(true)
  setEditedFoodId(id)
 }
  return (
    <div className="item-list-container"> 
      <h3 className='item-list-title'>Food List</h3>
      <div className="item-list-table">
        <div className="item-list-header item-list-row">
          <p>Image</p>
          <p>Name</p>
          <p>Category</p>
          <p>Price</p>
          <p className='act-header'>Actions</p>
        </div>
        {list.map((item,index)=>{
          return (
          <div className="item-list-element item-list-row" key={index}>
            <img className='item-list-element-img' src={`https://restaurant-project-ek2l.onrender.com/images/${item.image}`}/>
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>${item.price}</p>
              <div className='act-btn-container'>
              <button type='button' className='act-btn act-btn-delete' onClick={()=>{removeItem(item._id)}}>Remove</button>
              <button type='button' className='act-btn act-btn-edit' onClick={()=>handleClickEdit(item._id)}>Edit</button>
            </div>
            {openEditForm && 
              String(editedFoodId) === String(item._id) && (
  <form onSubmit={handleSubmit} className="food-item-container">
    <div className='name-category-container-left'>
    <label htmlFor="file-upload" className="item-img-wrapper">
      <img
         src={data.image instanceof File 
        ? URL.createObjectURL(data.image)
        : `https://restaurant-project-ek2l.onrender.com/images/${data.image}`}
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
      <p className='item-info-label'>Category</p>
      <input
        name="category" onChange={handleChange}
        className="item-input"
        value={data.category}
        placeholder="Category"
      />
     
      </div>
    
   
      <div className='name-category-container-right'>
        <p className='item-info-label'>Description</p>
      <input
        name="description" onChange={handleChange}
        className="item-input desc-input"
        value={data.description}
        placeholder="Description"
      />
      <p className='item-info-label'>Price</p>
      <input
      name="price" onChange={handleChange}
        className="item-input"
        value={data.price}
        placeholder="Price"
        type="number"
      />
     
    

    <div className="act-item-btn-container">
      <button type='button' className="act-item-btn cancel-btn" onClick={()=>setOpenEditForm(false)}>Cancel</button>
      <button type='submit' className="act-item-btn edit-btn">Edit</button>
    </div>
    </div>

  </form>
)}
          </div>)
          
        })}
              
        
      </div>





      
    </div>
  )
}

export default ItemsList;