import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_APP_API_BASE || "https://ec-course-api.hexschool.io/v2";
const API_PATH = import.meta.env.VITE_APP_API_PATH || "ellafang";

function Products() {
    //  products 的狀態，預設是空陣列 []
    const [products, setProducts] = useState([]);
    const navigate = useNavigate()


    useEffect(() => {
        const getProducts = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE}/api/${API_PATH}/products`
                );
                // 抓到資料後，印出來檢查
                console.log(response.data.products);

                // 把抓到的資料存進狀態裡，畫面才會更新！
                setProducts(response.data.products);

            } catch (error) {
                console.log(error.response);
            }
        }
        getProducts();
    }, []);

    //按鈕樣式
    const handleview = async (id) => {
        navigate(`/product/${id}`)
    }
    const addCart = async (id, qty = 1) => {
        try {
            const data = {
                product_id: id,
                qty,
            }
            const response = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, { data, });
            console.log(response.data);
            alert("加入購物車成功！"); // 順手加個提示
        } catch (error) {
            console.log(error.response);
        }
    }

    return (
        <div className="container mt-4">
            <div className="row">
                {/*確保這裡是小括號 () 包住整張卡片 */}
                {products.map((product) => (
                    <div className="col-md-4 mb-4" key={product.id}>
                        <div className="card h-100">
                            <img
                                src={
                                    product.imageUrl && product.imageUrl.trim() !== ""
                                        ? product.imageUrl
                                        : "https://placehold.co/300x200?text=No+Image"
                                }
                                className="card-img-top"
                                alt={product.title}
                                style={{ height: "200px", objectFit: "cover" }} // 加了圖片高度限制
                                onError={(e) => {
                                    e.target.src = "https://fakeimg.pl/300x200/282828/eae0d0/?text=No+Image";
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
                                <button type="button" className="btn btn-primary"
                                    onClick={() => addCart(product.id)}>
                                    加入購物車
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Products;