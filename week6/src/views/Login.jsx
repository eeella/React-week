import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

function Login() {
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm();

  const [authData, setAuthData] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, data);
      const { token, expired } = response.data;

      setAuthData({ token, expired });
    } catch (err) {
      alert(`登入失敗：${err.response.data.message}`);
    }
  };

  useEffect(() => {
    const existingToken = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (existingToken) {
      axios.defaults.headers.common.Authorization = existingToken;
      navigate("/admin/products");
      return;
    }

    if (authData) {
      const { token, expired } = authData;
      
      document.cookie = `hexToken=${token};expires=${new Date(expired)};path=/`;
      axios.defaults.headers.common.Authorization = token;

      alert("登入成功！");
      navigate("/admin/products");
    }
  }, [authData, navigate]);


  return (
    <div className="container login mt-5">
      <div className="row justify-content-center">
        <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
        <div className="col-8">
          <form id="form" className="form-signin" onSubmit={handleSubmitLogin(handleLogin)}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="username"
                placeholder="name@example.com"
                {...registerLogin("username", {
                  required: "請輸入 Email 地址",
                  pattern: { value: /^\S+@\S+$/i, message: "Email 格式不正確" },
                })}
                required
                autoFocus
              />
              <label htmlFor="username">Email address</label>
              {loginErrors.username && <p className="text-danger mt-1">{loginErrors.username.message}</p>}
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                {...registerLogin("password", {
                  required: "請輸入密碼",
                  minLength: { value: 6, message: "密碼長度至少需 6 碼" },
                })}
                required
              />
              <label htmlFor="password">Password</label>
              {loginErrors.password && <p className="text-danger mt-1">{loginErrors.password.message}</p>}
            </div>
            <button className="btn btn-lg btn-primary w-100 mt-3" type="submit">
              登入
            </button>
          </form>
        </div>
      </div>
      <p className="mt-5 mb-3 text-muted">&copy; 2025~∞ - 六角學院</p>
    </div>
  );
}

export default Login;