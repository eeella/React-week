import { useState, useEffect, useRef } from "react";
import { RotatingLines } from "react-loader-spinner";
import { useForm } from "react-hook-form";

import axios from "axios";
import * as bootstrap from "bootstrap";

import "../../assets/style.css";

import { currency } from "../../utils/filter";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Checkout() {
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({});
  const [pagination, setPagination] = useState({});
  const [cart, setCart] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(1);
  const productModalRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // 取得全部產品
  const getProducts = async (page = 1) => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/products?page=${page}`;
      const response = await axios.get(url);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  // 取得單一產品
  const getProduct = async (id) => {
    setLoadingProductId(id);
    try {
      const url = `${API_BASE}/api/${API_PATH}/product/${id}`;
      const response = await axios.get(url);
      setProduct(response.data.product);
    } catch (error) {
      console.log(error.response.data);
    } finally {
      setLoadingProductId(null);
    }
  };

  // 取得購物車列表
  const getCart = async () => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart`;
      const response = await axios.get(url);
      setCart(response.data.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  // 加入購物車
  const addCart = async (id, num) => {
    setLoadingCartId(id);
    const data = {
      product_id: id,
      qty: num,
    };
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart`;
      await axios.post(url, { data });
      getCart();
    } catch (error) {
      console.log(error.response.data);
    } finally {
      setLoadingCartId(null);
      productModalRef.current.hide();
    }
  };

  // 清除單一筆購物車
  const deleteCart = async (id) => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart/${id}`;
      await axios.delete(url);
      getCart();
    } catch (error) {
      console.log(error.response.data);
    }
  };

  // 清空購物車
  const deleteCartAll = async () => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/carts`;
      await axios.delete(url);
      getCart();
    } catch (error) {
      console.log(error.response.data);
    }
  };

  // 更新商品數量
  const updateCart = async (cartId, productId, qty = 1) => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart/${cartId}`;

      const data = {
        product_id: productId,
        qty,
      };
      await axios.put(url, { data });
      getCart();
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const onSubmit = async (data) => {
      try {
        const url = `${API_BASE}/api/${API_PATH}/order`;
        if(!cart.carts.length) {
          alert("購物車沒有商品！");
          return;
        }
        await axios.post(url, { data: { user: data, message: data.message } });
        reset();
        getCart();
      } catch (error) {
        console.error(error);
      }
  };

  const openModal = async (id) => {
    productModalRef.current.show();
    setCartQuantity(1);
    getProduct(id);
  };

  const handleClick = (event, page) => {
    event.preventDefault();
    getProducts(page);
  };

  
  useEffect(() => {
    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false,
    });

    document
      .querySelector("#productModal")
      .addEventListener("hide.bs.modal", () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });

    getProducts();
    getCart();
  }, []);

  return (
    <div className="container mt-5">
      {/* Product Modal */}
      <div className="modal" id="productModal" ref={productModalRef}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">產品名稱：{product.title}</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <img className="w-100" src={product.imageUrl} />
              <p className="mt-3">產品內容：{product.content}</p>
              <p>產品描述：{product.description}</p>
              <p>
                價錢：<del>原價 ${product.origin_price}</del>，特價：$
                {product.price}
              </p>
              <div className="d-flex align-items-center">
                <label style={{ width: "150px" }}>購買數量：</label>
                <button
                  className="btn btn-danger"
                  type="button"
                  id="button-addon1"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    setCartQuantity((pre) => (pre === 1 ? pre : pre - 1))
                  }
                >
                  <i className="fa-solid fa-minus"></i>
                </button>
                <input
                  className="form-control"
                  type="number"
                  value={cartQuantity}
                  min="1"
                  max="10"
                  onChange={(e) => setCartQuantity(Number(e.target.value))}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  id="button-addon2"
                  aria-label="Decrease quantity"
                  onClick={() => setCartQuantity((pre) => pre + 1)}
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => addCart(product.id, cartQuantity)}
              >
                加入購物車
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 產品列表 */}
      <table className="table align-middle">
        <thead>
          <tr>
            <th>圖片</th>
            <th>產品名稱</th>
            <th>價錢</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td style={{ width: "200px" }}>
                <div
                  style={{
                    height: "100px",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundImage: `url(${product.imageUrl})`,
                  }}
                />
              </td>
              <td>{product.title}</td>
              <td>
                <del className="h6">
                  原價： {currency(product.origin_price)} 元
                </del>
                <div className="h5">特價： {currency(product.price)} 元</div>
              </td>
              <td>
                <div className="btn-group btn-group-sm">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => openModal(product.id)}
                    disabled={loadingProductId === product.id}
                  >
                    {loadingProductId === product.id ? (
                      <RotatingLines
                        strokeColor="grey"
                        strokeWidth="5"
                        animationDuration="0.75"
                        width="96"
                        visible={true}
                      />
                    ) : (
                      "查看更多"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => addCart(product.id, 1)}
                    disabled={loadingCartId === product.id}
                  >
                    {loadingCartId === product.id ? (
                      <RotatingLines
                        strokeColor="#fff"
                        strokeWidth="5"
                        width="20"
                        visible={true}
                      />
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

      {/* 分頁 */}
      <nav aria-label="Page navigation example">
        <ul className="pagination">
          <li className="page-item">
            <a
              href="/"
              aria-label="Previous"
              className={`page-link ${pagination.has_pre ? "" : "disabled"}`}
              onClick={(event) =>
                handleClick(event, pagination.current_page - 1)
              }
            >
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          {[...new Array(pagination.total_pages)].map((_, i) => (
            <li className="page-item" key={`${i}_page`}>
              <a
                className={`page-link ${
                  i + 1 === pagination.current_page && "active"
                }`}
                href="/"
                onClick={(event) => handleClick(event, i + 1)}
              >
                {i + 1}
              </a>
            </li>
          ))}
          <li className="page-item">
            <a
              className={`page-link ${pagination.has_next ? "" : "disabled"}`}
              onClick={(event) =>
                handleClick(event, pagination.current_page + 1)
              }
              href="/"
              aria-label="Next"
            >
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* 購物車列表 */}
      <div className="text-end">
        <button
          className="btn btn-outline-danger"
          type="button"
          onClick={deleteCartAll}
        >
          清空購物車
        </button>
      </div>
      <table className="table align-middle">
        <thead>
          <tr>
            <th></th>
            <th>品名</th>
            <th>數量/單位</th>
            <th>單價</th>
          </tr>
        </thead>
        <tbody>
          {cart?.carts &&
            cart?.carts.map((item) => (
              <tr key={item.id}>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => deleteCart(item.id)}
                  >
                    <i className="bi bi-x" /> 刪除
                  </button>
                </td>
                <td>
                  {item.product.title}
                </td>
                <td>
                  <div className="input-group input-group-sm">
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      defaultValue={item.qty}
                      key={item.qty}
                      onChange={(e) =>
                        updateCart(item.id, item.product_id, Number(e.target.value))
                      }
                    />
                    <div className="input-group-text">/{item.product.unit}</div>
                  </div>
                </td>
                <td className="text-end">
                  {item.final_total !== item.total && (
                    <small className="text-success">折扣價：</small>
                  )}
                  {currency(item.final_total)}
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="text-end">
              總計
            </td>
            <td className="text-end">{currency(cart?.total)}</td>
          </tr>
          {cart?.final_total !== cart?.total ? (
            <tr>
              <td colSpan="3" className="text-end text-success">
                折扣價
              </td>
              <td className="text-end text-success">
                {currency(cart?.final_total)}
              </td>
            </tr>
          ) : (
            ""
          )}
        </tfoot>
      </table>

      {/* 表單資料 */}
      <div className="my-5 row justify-content-center">
        <form onSubmit={handleSubmit(onSubmit)} className="col-md-6">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              收件人姓名
            </label>
            <input
              id="name"
              type="text"
              className="form-control"
              placeholder="請輸入姓名"
              {...register("name", { required: "請輸入收件人姓名。" })}
            />
            {errors.name && (
              <p className="text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="請輸入 Email"
              {...register("email", {
                required: "請輸入 Email。",
                pattern: { value: /^\S+@\S+$/i, message: "Email 格式不正確。" },
              })}
            />
            {errors.email && (
              <p className="text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="tel" className="form-label">
              收件人電話
            </label>
            <input
              id="tel"
              type="tel"
              className="form-control"
              placeholder="請輸入電話"
              {...register("tel", {
                required: "請輸入收件人電話。",
                minLength: {
                  value: 8,
                  message: "電話號碼至少需要 8 碼。",
                },
                pattern: {
                  value: /^\d+$/,
                  message: "電話號碼格式不正確，僅限數字。",
                },
              })}
            />
            {errors.tel && <p className="text-danger">{errors.tel.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              收件人地址
            </label>
            <input
              id="address"
              type="text"
              className="form-control"
              placeholder="請輸入地址"
              {...register("address", { required: "請輸入收件人地址。" })}
            />
            {errors.address && (
              <p className="text-danger">{errors.address.message}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              留言
            </label>
            <textarea
              id="message"
              className="form-control"
              placeholder="留言"
              rows="3"
              {...register("message")}
            />
          </div>

          <div className="text-end">
            <button type="submit" className="btn btn-danger">
              送出訂單
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout;