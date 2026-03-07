// 確保這裡有 import useNavigate 和 useLocation
import { useEffect } from "react";
import { useState } from "react";
 import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_APP_API_BASE || "https://ec-course-api.hexschool.io/v2";
const API_PATH = import.meta.env.VITE_APP_API_PATH || "ellafang";

function SingleProduct() {
    const location = useLocation();
    // const navigate = useNavigate(); // 啟用 navigate 工具
    const navigate = useNavigate();
    const { id } = useParams()
    const [product, setProduct] = useState(null);
    useEffect(() => {

        const handleview = async (id) => {
            try {
                const response = await axios.get(`${API_BASE}/api/${API_PATH}/product/${id}`);
                console.log(response.data.product);
                setProduct(response.data.product)
            } catch (error) {
                console.log(error.response);
            }
        };
        handleview(id)
    }, [id]);

    const addCart = async (id, qty = 1) => {
        try {
            const data = {
                product_id: id,
                qty,
            }
            const response = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, { data, });
            console.log(response.data);

        } catch (error) {
            console.log(error.response);
        }
    }


    return (
        !product ? (<h2>查無此產品</h2>) :
            <div className="container mt-3">
                <div className="card h-100" style={{ width: '18rem' }}>
                    <img
                        src={
                            product.imageUrl && product.imageUrl.trim() !== ""
                                ? product.imageUrl
                                : "https://placehold.co/300x200?text=No+Image"
                        }
                        className="card-img-top"
                        alt={product.title}
                        style={{ height: "200px", objectFit: "cover" }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/300x200?text=No+Image";
                        }}
                    />
                    <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{product.title}</h5>
                        <p className="card-text text-muted">{product.description}</p>
                        <p className="card-text mt-auto text-danger fw-bold">
                            NT$ {product.price}
                        </p>
                        <p className="card-text">
                            <small className="text-body-secondary">
                                單位: {product.unit}
                            </small>
                        </p>
                        {/* 這裡改成返回按鈕 */}
                        <button type="button" 
                                className="btn btn-primary flex-grow-1"
                                onClick={() => addCart(product.id, 1)}>
                            加入購物車
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary flex-grow-1"
                            onClick={() => navigate(-1)}
                        >
                            返回
                        </button>
                    </div>
                </div>
            </div>
    );
}

export default SingleProduct;