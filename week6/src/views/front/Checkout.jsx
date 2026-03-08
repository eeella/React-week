import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as bootstrap from "bootstrap";

// 記得在最上面引入你剛剛做好的新元件！
import SingleProductModal from "../../component/SingleProductModal";

const API_BASE = "https://ec-course-api.hexschool.io/v2";
const API_PATH = "ellafang";

function Checkout() {
    // --- 狀態管理 (State) ---
    const [cart, setCart] = useState(null);
    const [products, setProducts] = useState([]);

    const [loadingCartId, setLoadingCartId] = useState(null);
    const [loadingViewId, setLoadingViewId] = useState(null);
    const [productDetail, setProductDetail] = useState(null);

    // --- DOM 參照 (Ref) ---
    const modalDomRef = useRef(null);
    const productModalRef = useRef(null);

    // --- 表單設定 ---
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        mode: 'onChange'
    });

    // --- API 函式定義區 ---
    const getCart = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
            setCart(response.data.data);
        } catch (error) {
            console.log("取得購物車失敗：", error.response);
        }
    };

    const getProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/${API_PATH}/products`);
            setProducts(response.data.products);
        } catch (error) {
            console.log("取得產品失敗：", error.response);
        }
    };

    const addCartItem = async (product_id, qty = 1) => {
        setLoadingCartId(product_id);
        try {
            await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {
                data: { product_id, qty }
            });
            getCart();
            alert("已加入購物車！");
        } catch (error) {
            console.log("加入購物車失敗：", error.response);
        } finally {
            setLoadingCartId(null);
        }
    };

    const clearCart = async () => {
        try {
            await axios.delete(`${API_BASE}/api/${API_PATH}/carts`);
            getCart();
        } catch (error) {
            console.log("清空失敗：", error.response);
        }
    };

    const removeCartItem = async (cartId) => {
        try {
            await axios.delete(`${API_BASE}/api/${API_PATH}/cart/${cartId}`);
            getCart();
        } catch (error) {
            console.log("刪除單一品項失敗：", error.response);
        }
    };

    const onSubmit = async (formData) => {
        try {
            const { message, ...user } = formData;
            const payload = {
                data: {
                    user: user,
                    message: message || ""
                }
            };
            const response = await axios.post(`${API_BASE}/api/${API_PATH}/order`, payload);
            alert(`結帳成功！您的訂單編號為：${response.data.orderId}`);
            reset();
            getCart();
        } catch (error) {
            console.log("結帳失敗：", error.response);
            alert("結帳失敗，請確認購物車內是否有商品！");
        }
    };

    // --- Modal 控制函式 ---
    const handleview = async (id) => {
        setLoadingViewId(id);
        try {
            const response = await axios.get(`${API_BASE}/api/${API_PATH}/product/${id}`);
            setProductDetail(response.data.product); // 將抓到的詳細資料存起來

            // 點擊的當下，確認 HTML 存在就立刻綁定並打開！
            if (modalDomRef.current) {
                // 如果還沒有綁定過 Bootstrap，就當場實體化它
                if (!productModalRef.current) {
                    productModalRef.current = new bootstrap.Modal(modalDomRef.current, {
                        keyboard: false,
                    });
                }
                // 打開視窗
                productModalRef.current.show();
            }
        } catch (error) {
            console.log(error.response);
        } finally {
            setLoadingViewId(null);
        }
    };

    const closeModal = () => {
        if (productModalRef.current) {
            productModalRef.current.hide(); // 關閉視窗

            //  強迫瀏覽器 解決黃字警告！
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }
    };

    // --- 控管 ---
    useEffect(() => {
        getProducts();
        getCart();

        if (modalDomRef.current) {
            productModalRef.current = new bootstrap.Modal(modalDomRef.current, {
                keyboard: false,
            });

            modalDomRef.current.addEventListener("hide.bs.modal", () => {
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            });
        }
    }, []);

    if (!cart) return <div className="container mt-5">讀取中...</div>;

    // --- 畫面渲染 ---
    return (
        <div className="container py-5">
            <h2>產品列表</h2>
            <table className="table align-middle mb-5">
                <thead>
                    <tr>
                        <th style={{ width: '150px' }}>圖片</th>
                        <th>商品名稱</th>
                        <th>價格</th>
                        <th className="text-end">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>
                                <img
                                    src={product.imageUrl || "https://placehold.co/100x100?text=No+Image"}
                                    alt={product.title}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    className="img-thumbnail"
                                />
                            </td>
                            <td>{product.title}</td>
                            <td><span className="text-danger fw-bold">NT$ {product.price}</span></td>
                            <td className="text-end">
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm d-flex justify-content-center align-items-center gap-1"
                                        style={{ width: '90px', height: '31px' }}
                                        onClick={() => handleview(product.id)}
                                        disabled={loadingViewId === product.id}
                                    >
                                        {loadingViewId === product.id ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            "查看更多"
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm d-flex justify-content-center align-items-center gap-1"
                                        style={{ width: '105px', height: '31px' }}
                                        onClick={() => addCartItem(product.id)}
                                        disabled={loadingCartId === product.id}
                                    >
                                        {loadingCartId === product.id ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            "加入購物車"
                                        )}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr className="my-5" />

            <h2>購物車列表</h2>
            <div className="text-end mt-4">
                <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                        if (window.confirm("確定要清空購物車嗎？")) clearCart();
                    }}
                    disabled={cart.carts?.length === 0}
                >
                    清空購物車
                </button>
            </div>

            <table className="table mt-3">
                <thead>
                    <tr>
                        <th scope="col"></th>
                        <th scope="col">品名</th>
                        <th scope="col">數量/單位</th>
                        <th scope="col" className="text-end">小計</th>
                    </tr>
                </thead>
                <tbody>
                    {cart?.carts?.map(carItem => (
                        <tr key={carItem.id}>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => removeCartItem(carItem.id)}
                                >
                                    刪除
                                </button>
                            </td>
                            <th scope="row">{carItem.product.title}</th>
                            <td>
                                <div className="input-group input-group-sm mb-3" style={{ width: '120px' }}>
                                    <input type="number" className="form-control" defaultValue={carItem.qty} readOnly />
                                    <span className="input-group-text">{carItem.product.unit}</span>
                                </div>
                            </td>
                            <td className="text-end">{carItem.final_total}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td className="text-end" colSpan="3">總計</td>
                        <td className="text-end fw-bold text-danger">{cart.final_total}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="my-5 row justify-content-center">
                <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" id="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="請輸入 Email" {...register("email", { required: "Email 為必填", pattern: { value: /^\S+@\S+$/i, message: "Email 格式不正確" } })} />
                        {errors.email && <p className="text-danger">{errors.email.message}</p>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">收件人姓名</label>
                        <input id="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`} placeholder="請輸入姓名" {...register("name", { required: "姓名為必填" })} />
                        {errors.name && <p className="text-danger">{errors.name.message}</p>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="tel" className="form-label">收件人電話</label>
                        <input id="tel" className={`form-control ${errors.tel ? 'is-invalid' : ''}`} placeholder="請輸入電話" {...register("tel", { required: "電話為必填", minLength: { value: 8, message: "電話最少 8 碼" }, maxLength: { value: 12, message: "電話最多 12 碼" } })} />
                        {errors.tel && <p className="text-danger">{errors.tel.message}</p>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="address" className="form-label">收件人地址</label>
                        <input id="address" className={`form-control ${errors.address ? 'is-invalid' : ''}`} placeholder="請輸入地址" {...register("address", { required: "地址為必填" })} />
                        {errors.address && <p className="text-danger">{errors.address.message}</p>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="message" className="form-label">留言</label>
                        <textarea id="message" className="form-control" cols="30" rows="5" {...register("message")}></textarea>
                    </div>
                    <div className="text-end">
                        <button type="submit" className="btn btn-danger">送出訂單</button>
                    </div>
                </form>
            </div>

            {/* 元件綁定！我們把資料跟方法當作 props 傳進去給子元件 */}
            <SingleProductModal
                modalRef={modalDomRef}
                productDetail={productDetail}
                closeModal={closeModal}
                addCartItem={addCartItem}
            />

        </div>
    );
}

export default Checkout;