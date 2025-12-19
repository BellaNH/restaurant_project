import "./Verifyorder.css"
import {Navigate, useSearchParams} from "react-router-dom"
import { useGlobalContext } from "../../Context/Context"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useEffect } from "react"
const Verifyorder = ()=>{
    const [searchParams,setSearchParams] = useSearchParams()
    const success = searchParams.get("success")
    const orderId = searchParams.get("orderId")

    console.log(success,orderId)
    const navigate = useNavigate()
    const {url} = useGlobalContext()
    const verifyorder = async ()=>{
        const response = await axios.post(`${url}/api/order/verifyorder`,
            {success: success==="true"
            ,orderId}
        )
        console.log(response)
        if(response.data.success){
           navigate("/myorders")
        }else{
           navigate("/")
        }
    }
    useEffect(()=>{
        verifyorder()
    },[])
    return(
        <div className="spinner-container">
           <div className="spinner"></div>
        </div>
    )
}
export default Verifyorder;