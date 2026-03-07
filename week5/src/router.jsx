// src/router.jsx
// 1. 確保引入的是 createHashRouter 而不是 createBrowserRouter
import { createHashRouter } from "react-router-dom"; 
import FrontendLayout from "./layout/FrontendLayout";
import Home from "./views/front/Home";
import Products from "./views/front/Products";
import Cart from "./views/front/Cart";
import SingleProduct from "./views/front/SingleProduct";

// 2. 使用 createHashRouter
export const router = createHashRouter([
    {
        path: '/',
        element: <FrontendLayout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: 'products', 
                element: <Products/>
            },
            {
                path: 'cart',
                element: <Cart />
            },
            {
                path: 'product/:id',
                element: <SingleProduct />
            }
        ]
    }
]);