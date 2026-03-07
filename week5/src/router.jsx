import { createHashRouter } from "react-router-dom";
import FrontendLayout from "./layout/FrontendLayout";
import Home from "./views/front/Home";
import Products from "./views/front/Products";
import Cart from "./views/front/Cart";
import SingleProduct from "./views/front/SingleProduct";
import NotFound from "./views/front/NotFound";
export const router = createHashRouter([
    {
        path: '/',
        element: <FrontendLayout />,
        children: [
            {
                index: true,// 預設首頁
                element: <Home />
            },
            {
                path: 'products', 
                element: <Products/>// 動態參數
            },
            {
                path: 'cart',
                element: <Cart />
            },
            {
                path: 'product/:id',
                element: <SingleProduct />
            },
            {
                path: '*', // 404 頁面
                element: <NotFound />
            }

        ]
    }
])