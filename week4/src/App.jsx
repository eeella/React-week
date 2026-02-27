import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import "./assets/style.css";

// 1. 引入抽離出去的組件
import ProductModal from "./component/ProductModal";
import Pagination from "./component/Pagination";

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

  // 修正：狀態名稱改為小寫 pageInfo，避免與組件 Pagination 衝突
  const [pageInfo, setPageInfo] = useState({});

  const ProductModalRef = useRef(null);
  const modalInstance = useRef(null);

  // --- 事件處理函式 ---

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
  };

  const handleModalImageChange = (index, value) => {
    setTemplateProduct((pre) => {
      const newImages = [...(pre.imagesUrl || [])];
      newImages[index] = value;
      if (value !== "" && index === newImages.length - 1 && newImages.length < 5) {
        newImages.push("");
      }
      if (value === "" && newImages.length > 1 && newImages[newImages.length - 1] === "") {
        newImages.pop();
      }
      return { ...pre, imagesUrl: newImages };
    });
  };

  const handleAddImage = () => {
    setTemplateProduct((pre) => ({
      ...pre,
      imagesUrl: [...(pre.imagesUrl || []), ""]
    }));
  };

  const handleRemoveImage = () => {
    setTemplateProduct((pre) => {
      const newImages = [...(pre.imagesUrl || [])];
      newImages.pop();
      return { ...pre, imagesUrl: newImages };
    });
  };

  // --- Modal 操作 ---

  const openModal = (item, type) => {
    setTemplateProduct({
      ...INITIAL_TEMPLATE_DATA,
      ...item,
      imagesUrl: item?.imagesUrl ? [...item.imagesUrl] : []
    });
    setModalType(type);

    if (!modalInstance.current) {
      modalInstance.current = new bootstrap.Modal(ProductModalRef.current);
    }
    modalInstance.current.show();
  };

  const closeModal = () => {
    if (modalInstance.current) {
      modalInstance.current.hide();
    }
  };

  // --- API 請求 ---

  const getData = async (page = 1) => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`);
      setProducts(response.data.products);
      setPageInfo(response.data.pagination); // 儲存分頁資訊
    } catch (err) {
      console.error(err.response?.data.message);
    }
  };

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
        imagesUrl: (templateProduct.imagesUrl || []).filter((url) => url !== ""),
      },
    };

    try {
      await axios[method](url, productData);
      getData();
      closeModal();
    } catch (error) {
      alert("操作失敗");
    }
  };

  const delProduct = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
      getData();
      closeModal();
    } catch (error) {
      alert("刪除失敗");
    }
  };
  // --- 圖片上傳處理 (示範用，實際上傳邏輯需依照後端 API 規範實作) ---
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file-to-upload", file);
      const response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData,);
      setTemplateProduct((pre) => ({
        ...pre,
        imageUrl: response.data.imageUrl,
      }));
    } catch (error) {
      console.log("圖片上傳失敗", error.response);

    }
};
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post(`${API_BASE}/admin/signin`, formData);
        const { token, expired } = response.data;
        document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
        axios.defaults.headers.common.Authorization = token;
        setisAuth(true);
        getData();
      } catch (error) {
        alert("登入失敗: " + (error.response?.data.message || "請檢查帳密"));
      }
    };

    useEffect(() => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("hexToken=")[1];

      if (token) {
        axios.defaults.headers.common.Authorization = token;
        axios.post(`${API_BASE}/api/user/check`)
          .then(() => {
            setisAuth(true);
            getData();
          })
          .catch(() => setisAuth(false));
      }
    }, []);

    return (
      <>
        {isAuth ? (
          <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>產品列表</h2>
              <button type="button" className="btn btn-primary" onClick={() => openModal({}, "create")}>
                建立新的產品
              </button>
            </div>
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>分類</th>
                  <th>產品名稱</th>
                  <th>原價</th>
                  <th>售價</th>
                  <th>是否啟用</th>
                  <th>編輯/刪除</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((item) => (
                    <tr key={item.id}>
                      <td>{item.category}</td>
                      <td>{item.title}</td>
                      <td>{item.origin_price}</td>
                      <td>{item.price}</td>
                      <td>
                        <span className={item.is_enabled ? "text-success" : "text-muted"}>
                          {item.is_enabled ? "啟用" : "未啟用"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal(item, "edit")}>
                            編輯
                          </button>
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => openModal(item, "delete")}>
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center">目前尚無產品</td></tr>
                )}
              </tbody>
            </table>
            {/* 使用 pageInfo 狀態並傳入更換頁面的 getData 函式 */}
            <Pagination pagination={pageInfo} onPageChange={getData} />
          </div>
        ) : (
          <div className="container mt-5">
            <div className="row justify-content-center">
              <div className="col-md-4">
                <form className="form-signin" onSubmit={handleSubmit}>
                  <h1 className="h3 mb-3 font-weight-normal text-center">管理員登入</h1>
                  <div className="form-floating mb-3">
                    <input id="username" type="email" className="form-control" name="username" value={formData.username} onChange={handleInputChange} placeholder="Email" required />
                    <label htmlFor="username">Email address</label>
                  </div>
                  <div className="form-floating mb-3">
                    <input id="password" type="password" className="form-control" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" required />
                    <label htmlFor="password">Password</label>
                  </div>
                  <button className="btn btn-lg btn-primary w-100" type="submit">登入</button>
                </form>
              </div>
            </div>
          </div>
        )}

        <ProductModal
          modalRef={ProductModalRef}
          modalType={modalType}
          templateProduct={templateProduct}
          handleModalInputChange={handleModalInputChange}
          handleModalImageChange={handleModalImageChange}
          handleAddImage={handleAddImage}
          handleRemoveImage={handleRemoveImage}
          updateProduct={updateProduct}
          delProduct={delProduct}
          uploadImage={uploadImage}
          closeModal={closeModal}
        />
      </>
    );
  }

  export default App;