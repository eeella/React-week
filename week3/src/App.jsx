import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import "./assets/style.css";

const API_BASE = import.meta.env.VITE_APP_API_BASE || "https://ec-course-api.hexschool.io/v2";
const API_PATH = import.meta.env.VITE_APP_API_PATH || "ellafang";

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};


function App() {
  // --- 狀態管理 (State) ---
  const [formData, setFormData] = useState({
    username: "ella.fang@gmail.com",
    password: "d3330594",
  });
  const [isAuth, setisAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState("");

  const productModalRef = useRef(null);
  const modalInstance = useRef(null);

  // --- 事件處理函式 ---

  // 【正確的輸入處理】
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTemplateProduct((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  //改變圖片網址的函式
  const handleModalImageChange = (index, value) => {
    setTemplateProduct((pre) => {
      const newImages = [...pre.imagesUrl];
      newImages[index] = value;
      //優化ui
      // 填寫最後一個空輸入框時，自動新增空白輸入框
      if (
        value !== "" &&
        index === newImages.length - 1 &&
        newImages.length < 5
      ) {
        newImages.push("");
      }

      // 清空輸入框時，移除最後的空白輸入框
      if (
        value === "" &&
        newImages.length > 1 &&
        newImages[newImages.length - 1] === ""
      ) {
        newImages.pop();
      }
      return {
        ...pre,
        imagesUrl: newImages,
      };
    });
  };

  // 新增圖片的函式
  const handleAddImage = () => {
    setTemplateProduct((pre) => {
      const newImages = [...pre.imagesUrl];
      newImages.push("");
      return {
        ...pre,
        imagesUrl: newImages,
      };
    });
  };
  
  // 刪除圖片的函式
  const handleRemoveImage = () => {
    setTemplateProduct((pre) => {
      const newImages = [...pre.imagesUrl];
      newImages.pop();
      return {
        ...pre,
        imagesUrl: newImages,
      };
    });
  };

  // 【彈出視窗函式】
  const openModal = (item, type) => {
    setTemplateProduct((prev) => ({ ...prev, ...item }));
    setModalType(type);
    if (!modalInstance.current) {
      modalInstance.current = new bootstrap.Modal(productModalRef.current);
    }
    modalInstance.current.show();
  };

  //關閉視窗函式
  const closeModal = () => {
    if (modalInstance.current) {
      modalInstance.current.hide();
    }
  };

  // 【取得資料函式】
  const getData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(response.data.products);
    } catch (err) {
      console.error(err.response?.data.message);
    }
  };

  // 【檢查登入函式】
  const checkLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/user/check`);
      console.log("驗證成功:", res.data);
      alert("目前為登入狀態");
      getData();
    } catch (error) {
      console.error(error.response?.data.message);
      alert("驗證失敗，請重新登入");
      setisAuth(false);
    }
  };

  // 【useEffect 僅保留 token 設定】
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("hexToken=")[1];
    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }
  }, []);

  //更新產品資料的函式
  const updateProduct = async () => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = "post";
    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${templateProduct.id}`;
      method = "put";
    }
    const productData = {
      data: {
        ...templateProduct,
        origin_price: Number(templateProduct.origin_price),
        price: Number(templateProduct.price),
        is_enabled: templateProduct.is_enabled ? 1 : 0,
        // 優化圖片資料：過濾掉空字串，確保只傳送有效的圖片網址
        imagesUrl: templateProduct.imagesUrl.filter((url) => url !== ""),
      },
    };
    try {
      const response = await axios[method](url, productData);
      console.log(response.data);
      getData();
      closeModal();
    } catch (error) {
      console.error(error.response);
    }
  };

  // 刪除產品的函式 (修正：已加上正確的結束括號)
  const delProduct = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
      console.log(response.data);
      getData();
      closeModal();
    } catch (error) {
      console.error(error.response);
    }
  };

  // 【登入提交處理】
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common.Authorization = `${token}`;
      setisAuth(true);
      getData();
    } catch (error) {
      alert("登入失敗: " + (error.response?.data.message || "請檢查帳密"));
    }
  };

  return (
    <>
      {isAuth ? (
        <div className="container">
          <h2>產品列表</h2>
          <div className="text-end mb-3">
            <button type="button" className="btn btn-primary" onClick={() => openModal({}, "create", INITIAL_TEMPLATE_DATA)}>
              建立新的產品
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>分類</th>
                <th>產品名稱</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>查看細節</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((item) => (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <th>{item.title}</th>
                    <td>{item.origin_price}</td>
                    <td>{item.price}</td>
                    <td className={`${item.is_enabled && 'text-success'}`}>{item.is_enabled ? "啟用" : "未啟用"}</td>
                    <td>
                      <div className="btn-group">
                        <button type="button" className="btn btn-outline-primary btn-sm"
                          onClick={() => openModal(item, "edit")}
                        >
                          編輯
                        </button>
                        <button type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => openModal(item, "delete")} >刪除</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6">尚無產品資料</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input id="username" type="email" className="form-control" name="username" value={formData.username} onChange={handleInputChange} autoComplete="username" />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input id="password" type="password" className="form-control" name="password" value={formData.password} onChange={handleInputChange} autoComplete="current-password" />
                  <label htmlFor="password">Password</label>
                </div>
                <button className="btn btn-lg btn-primary w-100 mt-3" type="submit">登入</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 區塊 */}
      <div ref={productModalRef} className="modal fade" id="productModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className={`modal-header bg-${modalType === 'delete' ? 'danger' : 'dark'} text-white`}>
              <h5 id="productModalLabel" className="modal-title">
                <span>{modalType === 'delete' ? '刪除' : modalType === 'edit' ? '編輯' : '新增'}產品</span>
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {modalType === 'delete' ? (
                <p className="fs-5">您確定要刪除這個產品嗎？
                  <span className="text-danger">{templateProduct.title}</span>
                </p>
              ) : (
                <div className="row">
                  <div className="col-sm-4">
                    <div className="mb-2">
                      <div className="mb-3">
                        <label htmlFor="imageUrl" className="form-label">
                          輸入圖片網址
                        </label>
                        {/* 修正：把錯誤的 onChange 改回來，避免當機 */}
                        <input
                          type="text"
                          id="imageUrl"
                          name="imageUrl"
                          className="form-control"
                          placeholder="請輸入圖片連結"
                          value={templateProduct.imageUrl}
                          onChange={handleModalInputChange}
                        />
                      </div>
                      {templateProduct.imageUrl && (
                        <img
                          className="img-fluid"
                          src={templateProduct.imageUrl} alt="主圖" />
                      )}
                    </div>
                    <div>
                      {templateProduct.imagesUrl?.map((url, index) => (
                        <div key={index} className="mb-2">
                          <label htmlFor={`imagesUrl${index}`} className="form-label">
                            備用圖片 {index + 1}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="請輸入圖片連結"
                            value={url}
                            onChange={(e) => {
                              const newImages = [...templateProduct.imagesUrl];
                              newImages[index] = e.target.value;
                              setTemplateProduct({ ...templateProduct, imagesUrl: newImages });
                            }}
                          />
                          {url && <img className="img-fluid" src={url} alt={`圖片${index + 1}`} />}
                        </div>
                      ))}
                      {
                        //綁定新增優化：當最後一個輸入框有值且總數未達5時，顯示新增按鈕
                        templateProduct.imagesUrl?.length < 5 &&
                        templateProduct.imagesUrl[templateProduct.imagesUrl.length - 1] !== "" &&
                        <button className="btn btn-outline-primary btn-sm d-block w-100"
                          onClick={handleAddImage}
                        >
                          新增圖片
                        </button>
                      }
                    </div>
                    <div>
                      {
                        //綁定刪除優化：當最後一個輸入框為空且總數大於1時，顯示刪除按鈕
                        templateProduct.imagesUrl?.length > 0 &&
                        templateProduct.imagesUrl[templateProduct.imagesUrl.length - 1] === "" &&
                        <button className="btn btn-outline-danger btn-sm d-block w-100"
                          onClick={handleRemoveImage}
                        >
                          刪除圖片
                        </button>
                      }

                    </div>
                  </div>
                  <div className="col-sm-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">標題</label>
                      <input name="title"
                        id="title"
                        type="text"
                        className="form-control"
                        placeholder="請輸入標題"
                        value={templateProduct.title}
                        onChange={handleModalInputChange}
                      />
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="category" className="form-label">分類</label>
                        <input name="category"
                          id="category"
                          type="text"
                          className="form-control"
                          placeholder="請輸入分類"
                          value={templateProduct.category}
                          onChange={handleModalInputChange}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="unit" className="form-label">單位</label>
                        <input name="unit"
                          id="unit" type="text"
                          className="form-control"
                          placeholder="請輸入單位"
                          value={templateProduct.unit}
                          onChange={handleModalInputChange}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="origin_price" className="form-label">原價</label>
                        <input
                          name="origin_price"
                          id="origin_price"
                          type="number" min="0"
                          className="form-control"
                          placeholder="請輸入原價"
                          value={templateProduct.origin_price}
                          onChange={handleModalInputChange}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="price" className="form-label">售價</label>
                        <input
                          name="price"
                          id="price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入售價"
                          value={templateProduct.price}
                          onChange={handleModalInputChange}
                        />
                      </div>
                    </div>
                    <hr />

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">產品描述</label>
                      <textarea
                        name="description"
                        id="description"
                        className="form-control"
                        placeholder="請輸入產品描述"
                        value={templateProduct.description}
                        onChange={handleModalInputChange}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">說明內容</label>
                      <textarea
                        name="content"
                        id="content"
                        className="form-control"
                        placeholder="請輸入說明內容"
                        value={templateProduct.content}
                        onChange={handleModalInputChange}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          name="is_enabled"
                          id="is_enabled"
                          className="form-check-input"
                          type="checkbox"
                          checked={templateProduct.is_enabled}
                          onChange={handleModalInputChange}
                        />
                        <label className="form-check-label" htmlFor="is_enabled">
                          是否啟用
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {modalType === 'delete' ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => delProduct(templateProduct.id)}
                >
                  確認刪除
                </button>
              ) : (
                <>
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>
                    取消
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => updateProduct()}>
                    確認
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;