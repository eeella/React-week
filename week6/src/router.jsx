import { createHashRouter } from "react-router-dom";

import Checkout from "./views/front/Checkout";
import NotFound from "./views/NotFound";
import Login from "./views/Login";
import Products from "./views/admin/Products";

import Navbar from "./layout/Navbar";

export const router = createHashRouter([
  {
    path: "/",
    element: <Navbar />,
    children: [
      {
        index: true,
        element: <Checkout />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "admin/products",
        element: <Products />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
