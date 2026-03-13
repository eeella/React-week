import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_APP_API_BASE || "https://ec-course-api.hexschool.io/v2";
const API_PATH = import.meta.env.VITE_APP_API_PATH || "ellafang";


function Cart() {
    // 初始值設為物件或 null 比較好
    const [cart, setCart] = useState(null);

    // 取得購物車列表
    const getCart = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
            //API 的購物車資料在 response.data.data 裡面
            setCart(response.data.data);
            console.log("購物車內容：", response.data.data);
        } catch (error) {
            console.log("取得購物車失敗：", error.response);
        }
    };

    useEffect(() => {
        getCart();
    }, []);

    // 如果資料還沒抓到，先顯示讀取中
    if (!cart) return <div className="container">讀取中...</div>;

    return (
        // src/views/front/Cart.jsx
        <div className="container">
            <h2>購物車列表</h2>
            <div className="text-end mt-4">
                <button type="button" className="btn btn-outline-danger">
                    清空購物車
                </button>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col"></th>
                        <th scope="col">品名</th>
                        <th scope="col">數量/單位</th>
                        <th scope="col">小計</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        cart?.carts?.map(carItem => (
                            <tr key={carItem.id}>
                                <td>
                                    <button type="button" className="btn btn-outline-danger btn-sm">
                                        刪除
                                    </button>
                                </td>
                                <th scope="row">
                                    {carItem.product.title}
                                </th>
                                <td>
                                    <div className="input-group input-group-sm mb-3">
                                        <input 
                                        type="number" 
                                        className="form-control" 
                                        aria-label="Sizing example input" 
                                        aria-describedby="inputGroup-sizing-sm"
                                        defaultValue={carItem.qty}
                                        />
                                        <span 
                                        className="input-group-text" 
                                        id="inputGroup-sizing-sm">
                                             {carItem.product.unit}
                                        </span>
                                    </div>
                                </td>
                                <td className="text-end">
                                    {carItem.final_total}
                                </td>
                            </tr>
                        ))
                    }

                </tbody>
                <tfoot>
                    <tr>
                        <td className="text-end" colSpan="3">
                            總計
                        </td>
                        <td className="text-end">
                            {cart.final_total}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}

export default Cart
