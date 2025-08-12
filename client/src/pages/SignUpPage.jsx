import React, { useState } from "react";
import "../styles/SignUpPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, getUserDetails } from "../services/UserService";
import { setToken } from "../utils/auth";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsLoading(true);
      await registerUser({ username, email, password, confirmPassword });
      const res = await loginUser({ email, password });
      const token = res?.data?.token;
      if (!token) throw new Error("Không nhận được token");
      const payload  = JSON.parse(atob(token.split(".")[1]));
      const expireAt = payload.exp * 1000;
      setToken(token, expireAt, true);
      const me = await getUserDetails(token);
      localStorage.setItem("user", JSON.stringify(me.data));
      navigate("/", { replace: true });
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup-container">
        <h2>Đăng ký thành viên</h2>

        {errorMessage && (
          <div style={{ color: "red", fontWeight: "bold" }} className="login-error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
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
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-signup" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : "Đăng ký"}
          </button>

          <div className="signup-separator">- Bạn đã có tài khoản -</div>
          <button
            type="button"
            className="btn-register"
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
