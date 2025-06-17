import "./ExploreFood.css"
import { FiPlus } from "react-icons/fi";
import { useEffect, useState } from "react";
import axios from "axios"
import {assets} from "../../assets/admin_assets/admin_assests"
import {toast} from "react-toastify";
import { useGlobalContext } from "../../Context/Context";
const ExploreFood = ({selectedCategory,setSelectedCategory})=> {
  const [image,setImage]= useState(null)
  const [isOpenedForm,setIsopenedForm] = useState(false)
  const {categories,fetchCategories,isAdmin, setIsAdmin}= useGlobalContext()

  const [data,setData]= useState({
    name:"",
    image:""
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
    formData.append("image",image);
    const response = await axios.post(`http://localhost:4000/api/category/addCategory`,formData,
      {headers:{
        Authorization:`Bearer ${localStorage.getItem("token")}`
      }}
    );
    console.log(response)
    if(response.data.success){
      setIsopenedForm(!isOpenedForm)
      setData({
        name:"",
        image:""
      })
      fetchCategories()
      
      setImage(null)
      toast.success(response.data.message)
    }else{
      toast.error(response.data.message)
    }
  }
   useEffect(()=>{
    console.log(data)
   },[data])

    return(
    <div className="menu" id="menu">   
  <div className="menu-header">
    <h3 className="menu-title">Explore our menu</h3>
    {isAdmin && 
    <button onClick={()=>setIsopenedForm(true)} className="menu-header-add-btn">
      <FiPlus className="menu-header-add-icon" />
      Add Category
    </button>}
  </div>

  <p className="menu-text">
    Explore our menuExplore our menuExplore our menuExplore our menuExplore our menuExplore our menuExplore our menuExplore our menuExplore our menuExplore our menu
  </p>

  <div className="menu-list">
    {categories && categories.map((section, index) => (
      <div className="section" key={index}>
        {console.log(section.image)}
        <img
          onClick={() =>
            setSelectedCategory((prev) => (prev === section.name ? "All" : section.name))
          }
          className={selectedCategory === section.name ? "section-img active" : "section-img"}
          src={`http://localhost:4000/images/${section.image}`}
          alt="category"
        />
        <p className="section-name">{section.name}</p>
      </div>
    ))}
  </div>



  {isOpenedForm && 
  <form onSubmit={onSubmitHandler} className="category-add-form">
     <div className="category-add-form-upload-img-container">
          <p className="add-category-text">Upload Image</p>
          <div className="category-add-form-upload-img-area">
            <label htmlFor="image">
              <img src={image?URL.createObjectURL(image):assets.upload_area} className="category-add-form-upload-img"/>
            </label>
            <input onChange={(e)=>(setImage(e.target.files[0]))} type="file" id="image" hidden required/>
    
          </div>
         </div>
         <p className="add-category-text">Category name</p>
    <input
        onChange={onChangeHandler}
        name="name" 
        className="category-add-form-input"
        placeholder="Category"
      />
    <div className="act-category-btn-container">
      <button type='button' className="act-item-btn cancel-btn" onClick={()=>setIsopenedForm(false)}>Cancel</button>
      <button type='submit' className="act-item-btn edit-btn">Add</button>
    </div>
   

  </form>
}

  <hr />
</div>
)
}
export default ExploreFood