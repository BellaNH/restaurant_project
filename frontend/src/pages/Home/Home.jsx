import React, { useState } from "react";
import Navbar from "../../components/NavBar/NavBar";
import "./Home.css"
import Header from "../../components/Header/Header";
import ExploreFood from "../../components/ExploreFood/ExploreFood";
import FoodList from "../../components/FoodList/FoodList";

const Home = ()=>{
    const [selectedCategory,setSelectedCategory] = useState("All")
    return(
    <>
    <Header/>
    <ExploreFood selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
    <FoodList selectedCategory={selectedCategory}/>

    </>)
}
export default Home