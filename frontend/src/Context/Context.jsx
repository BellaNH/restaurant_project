import { createContext, useContext, useEffect, useState } from "react";
import { food_list } from "../assets/frontend_assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api.js";

axios.defaults.withCredentials = true;

const AppContext = createContext();
const AppProvider = ({ children }) => {
  const [cardItems, setCardItems] = useState({});
  const url = API_BASE_URL;
  const [list,setList] = useState([])
  const [listPage,setListPage] = useState(1)
  const [listPages,setListPages] = useState(1)
  const [listTotal,setListTotal] = useState(0)
  const [listLimit,setListLimit] = useState(12)
  const [listLoading,setListLoading] = useState(false)
  const [categories,setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [lastListFetch, setLastListFetch] = useState(0);
  const [lastCategoriesFetch, setLastCategoriesFetch] = useState(0);
  const [isAdmin, setIsAdmin] = useState();

  // Auth-related state (can be extended later)
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("registeredUserId") || ""
      : ""
  );

  const fetchCategories = async (force = false) => {
    const now = Date.now();
    if (
      !force &&
      lastCategoriesFetch &&
      now - lastCategoriesFetch < 5 * 60 * 1000
    ) {
      return;
    }
    setCategoriesLoading(true);
    try {
      const response = await axios.get(`${url}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.data);
        setLastCategoriesFetch(now);
      } else {
        toast.error(response.data.error || "Failed to load categories");
      }
    } catch (error) {
      toast.error("Unable to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const addtocart = async (itemId) => {
    setCardItems(
      !cardItems[itemId]
        ? (prev) => ({ ...prev, [itemId]: 1 })
        : (prev) => ({ ...prev, [itemId]: prev[itemId] + 1 })
    );
    if (isLoggedin) {
      try {
        await axios.post(`${url}/cart/add`, { itemId });
      } catch (error) {
        toast.error("Could not add item to cart");
      }
    }
  };

  const removefromcard = async (itemId) => {
    setCardItems((prev) =>
      prev[itemId] > 1
        ? { ...prev, [itemId]: prev[itemId] - 1 }
        : (() => {
            const { [itemId]: _, ...rest } = prev;
            return rest;
          })()
    );
    if (isLoggedin) {
      try {
        await axios.post(`${url}/cart/remove`, { itemId });
      } catch (error) {
        toast.error("Could not remove item");
      }
    }
  };

  const fetchCartItems = async () => {
    setCartLoading(true);
    try {
      const response = await axios.post(`${url}/cart/get`, {});
      response.data.success
        ? setCardItems(response.data.data)
        : setCardItems({});
    } catch (error) {
      setCardItems({});
    } finally {
      setCartLoading(false);
    }
  };

  const fetchList = async (page = 1, force = false) => {
    const now = Date.now();
    if (
      !force &&
      lastListFetch &&
      page === listPage &&
      now - lastListFetch < 5 * 60 * 1000
    ) {
      return;
    }
    setListLoading(true);
    try {
      const response = await axios.get(
        `${url}/api/food/list?page=${page}&limit=${listLimit}`
      );
      if (response.data.success) {
        setList(response.data.data);
        if (response.data.pagination) {
          setListPage(response.data.pagination.page);
          setListPages(response.data.pagination.pages);
          setListTotal(response.data.pagination.total);
          setListLimit(response.data.pagination.limit || listLimit);
        }
        setLastListFetch(now);
      } else {
        toast.error(response.data.message || "Failed to load menu");
      }
    } catch (error) {
      toast.error("Unable to load menu");
    } finally {
      setListLoading(false);
    }
  };

  const getTotalAmount = () => {
    let totalAmount = 0;
    for (const item in cardItems) {
      const food_item = list.find((product) => product._id === item);
      if (food_item) {
        totalAmount = totalAmount + food_item.price * cardItems[item];
      }
    }
    return totalAmount;
  };

  const userType = async () => {
    try {
      const response = await axios.post(`${url}/api/user/role`, {});
      if (response.data && response.data.success) {
        localStorage.setItem("isAdmin", response.data.isAdmin);
        setIsAdmin(response.data.isAdmin);
        setIsLoggedin(true);
      } else {
        setIsLoggedin(false);
        setIsAdmin(false);
      }
    } catch (error) {
      // silently fail; user not admin or token invalid
      setIsLoggedin(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCartItems();
      await userType();
    };
    fetchList();
    fetchCategories();
    loadData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        food_list,
        cardItems,
        setCardItems,
        addtocart,
        removefromcard,
        getTotalAmount,
        url,
        list,
        listPage,
        listPages,
        listTotal,
        listLimit,
        listLoading,
        fetchList,
        fetchCategories,
        categories,
        categoriesLoading,
        setCategories,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        registeredUserId,
        setRegisteredUserId,
        isAdmin,
        setIsAdmin,
        userType,
        setList,
        cartLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export const useGlobalContext = () => {
  return useContext(AppContext);
};
export { AppContext, AppProvider };
