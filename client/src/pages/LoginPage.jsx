import React, { useState } from "react";
import "../styles/LoginPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import * as UserService from "../services/UserService";
import { setToken } from "../utils/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await UserService.loginUser({ email, password });
      const token = res?.data?.token;
      if (!token) throw new Error("Không nhận được token");

      const payload = JSON.parse(atob(token.split(".")[1]));
      const expireAt = payload.exp * 1000;
      setToken(token, expireAt, remember);
      const me = await UserService.getUserDetails(token);
      localStorage.setItem("user", JSON.stringify(me.data));

      navigate("/", { replace: true });
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <h2>Đăng nhập hệ thống</h2>

        {errorMessage && (
          <div style={{ color: "red", fontWeight: "bold" }} className="login-error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            Ghi nhớ
          </label>

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : "Đăng nhập"}
          </button>

          <div className="login-separator">- HOẶC -</div>

          <button
            type="button"
            className="btn-register"
            onClick={() => navigate("/register")}
          >
            Tạo tài khoản
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
