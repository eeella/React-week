/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

// 🟢 修正路徑：從 src/views/front 跳兩層回到 src 找 assets 資料夾
import "../../assets/style.css";

const API_BASE = "https://ec-course-api.hexschool.io/v2";
const API_PATH = "ellafang"; // 👈 請確認這是你的 API PATH

function Login() {
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  // React Hook Form 設定
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      username: "",
      password: "",
    }
  });

  // 取得產品列表 (登入成功後執行)
  const getData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (err) {
      console.error(err.response?.data.message);
    }
  };

  // 🟢 登入處理：data 會自動帶入表單內容
  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, data);
      const { token, expired } = res.data;

      // 儲存 Token 到 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common.Authorization = token;

      await getData();
      setIsAuth(true);
      alert("登入成功！");
    } catch (err) {
      alert("登入失敗: " + (err.response?.data.message || "請檢查帳號密碼"));
    }
  };

  return (
    <div className="container py-5">
      {isAuth ? (
        /* 登入後的產品列表介面 */
        <div className="row mt-5">
          <div className="col-md-6">
            <h2>後台產品列表</h2>
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>產品名稱</th>
                  <th>售價</th>
                  <th>細節</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.price}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => setTempProduct(item)}>
                        查看細節
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="col-md-6">
            <h2>單一產品細節</h2>
            {tempProduct ? (
              <div className="card shadow-sm">
                <img src={tempProduct.imageUrl} className="card-img-top" alt={tempProduct.title} />
                <div className="card-body">
                  <h5>{tempProduct.title}</h5>
                  <p className="text-muted">{tempProduct.description}</p>
                </div>
              </div>
            ) : (
              <p className="text-secondary alert alert-light">請選擇產品以查看細節</p>
            )}
          </div>
        </div>
      ) : (
        /* 🔴 登入表單介面 */
        <div className="row justify-content-center py-5">
          <div className="col-md-4">
            <div className="card p-4 shadow-sm border-0">
              <h1 className="h4 mb-4 text-center fw-bold">管理員登入</h1>
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Email 欄位 */}
                <div className="form-floating mb-3">
                  <input
                    id="username"
                    type="email"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    placeholder="name@example.com"
                    {...register("username", {
                      required: "Email 為必填",
                      pattern: { value: /^\S+@\S+$/i, message: "Email 格式不正確" }
                    })}
                  />
                  <label htmlFor="username">Email address</label>
                  {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
                </div>

                {/* 密碼欄位：6-8 碼驗證 */}
                <div className="form-floating mb-3">
                  <input
                    id="password"
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Password"
                    {...register("password", {
                      required: "密碼為必填",
                      minLength: { value: 6, message: "密碼至少 6 碼" },
                      maxLength: { value: 8, message: "密碼最多 8 碼" }
                    })}
                  />
                  <label htmlFor="password">Password</label>
                  {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>

                <button className="btn btn-primary w-100 py-2 fw-bold" type="submit">
                  登入系統
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;