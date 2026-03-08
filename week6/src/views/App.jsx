import { router } from "../router";
import { RouterProvider } from "react-router-dom";
//  views 資料夾，才能看到 assets 資料夾
import "../assets/style.css";

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App;