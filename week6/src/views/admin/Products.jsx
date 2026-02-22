import { useEffect, useRef, useState } from "react";
import axios from "axios";

import * as bootstrap from "bootstrap";
import ProductModal from "../../component/ProductModal";
import Pagination from "../../component/Pagination";

import "../../assets/style.css";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});

  const productModalRef = useRef(null);
  const [modalType, setModalType] = useState("");
  const [templateData, setTemplateData] = useState({
    id: "",
    imageUrl: "",
    title: "",
    category: "",
    unit: "",
    origin_price: 0,
    price: 0,
    description: "",
    content: "",
    is_enabled: false,
    imagesUrl: [],
  });

  const navigate = useNavigate();

  const openModal = (product, type) => {
    setTemplateData({
      id: product.id || "",
      imageUrl: product.imageUrl || "",
      title: product.title || "",
      category: product.category || "",
      unit: product.unit || "",
      origin_price: product.origin_price || 0,
      price: product.price || 0,
      description: product.description || "",
      content: product.content || "",
      is_enabled: product.is_enabled || false,
      imagesUrl: product.imagesUrl || [],
    });
    productModalRef.current.show();
    setModalType(type);
  };

  const handleFileChange = async (e) => {
    const url = `${API_BASE}/api/${API_PATH}/admin/upload`;

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file-to-upload", file);

      let res = await axios.post(url, formData);
      const uploadedImageUrl = res.data.imageUrl;

      setTemplateData((prevTemplateData) => ({
        ...prevTemplateData,
        imageUrl: uploadedImageUrl,
      }));
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const closeModal = () => {
    productModalRef.current.hide();
  };

  const updateProductData = async (id) => {
    let product;
    if (modalType === "edit") {
      product = `product/${id}`;
    } else {
      product = `product`;
    }

    const url = `${API_BASE}/api/${API_PATH}/admin/${product}`;
    const productData = {
      data: {
        ...templateData,
        origin_price: Number(templateData.origin_price),
        price: Number(templateData.price),
        is_enabled: templateData.is_enabled ? 1 : 0,
        imageUrl: templateData.imageUrl,
      },
    };

    try {
      let response;
      if (modalType === "edit") {
        response = await axios.put(url, productData);
        console.log("更新成功", response.data);
      } else {
        response = await axios.post(url, productData);
        console.log("新增成功", response.data);
      }

      productModalRef.current.hide();
      getProductData();
    } catch (err) {
      if (modalType === "edit") {
        console.error("更新失敗", err.response.data.message);
      } else {
        console.error("新增失敗", err.response.data.message);
      }
    }
  };

  const delProductData = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      console.log("刪除成功", response.data);
      productModalRef.current.hide();
      getProductData();
    } catch (err) {
      console.error("刪除失敗", err.response.data.message);
    }
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setTemplateData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value,
    }))
  };

  const handleImageChange = (index, value) => {
    setTemplateData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages[index] = value;

      if (
        value !== "" &&
        index === newImages.length - 1 &&
        newImages.length < 5
      ) {
        newImages.push("");
      }

      if (newImages.length > 1 && newImages[newImages.length - 1] === "") {
        newImages.pop();
      }

      return { ...prevData, imagesUrl: newImages };
    });
  };

  const handleAddImage = () => {
    setTemplateData((prevData) => ({
      ...prevData,
      imagesUrl: [...prevData.imagesUrl, ""],
    }));
  };

  const handleRemoveImage = () => {
    setTemplateData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages.pop();
      return { ...prevData, imagesUrl: newImages };
    });
  };

  const getProductData = async (page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`
      );
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common.Authorization = token;

    const checkAdmin = async () => {
      try {
        await axios.post(`${API_BASE}/api/user/check`);
        getProductData();
      } catch (err) {
        console.log(err.response.data.message);
        navigate("/login");
      }
    };
    checkAdmin();

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
  }, [navigate]);

  return (
    <>
        <div>
          <div className="container">
            <div className="d-flex justify-content-between mt-4">
              <button
                className="btn btn-primary"
                onClick={() => openModal("", "new")}
              >
                建立新的產品
              </button>
            </div>
            <table className="table mt-4">
              <thead>
                <tr>
                  <th width="120">分類</th>
                  <th>產品名稱</th>
                  <th width="120">原價</th>
                  <th width="120">售價</th>
                  <th width="100">是否啟用</th>
                  <th width="120">編輯</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.category}</td>
                    <td>{product.title}</td>
                    <td className="text-end">{product.origin_price}</td>
                    <td className="text-end">{product.price}</td>
                    <td>
                      {product.is_enabled ? (
                        <span className="text-success">啟用</span>
                      ) : (
                        <span>未啟用</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => openModal(product, "edit")}
                        >
                          編輯
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => openModal(product, "delete")}
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination pagination={pagination} changePage={getProductData} />
          </div>
        </div>
      <ProductModal
        modalType={modalType}
        templateData={templateData}
        onCloseModal={closeModal}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        onImageChange={handleImageChange}
        onAddImage={handleAddImage}
        onRemoveImage={handleRemoveImage}
        onUpdateProduct={updateProductData}
        onDeleteProduct={delProductData}
      />
    </>
  );
}

export default Products;
