import { useEffect, useState } from "react";
import moment from "moment";
import "moment/locale/vi";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Profile.css";

export default function Profile() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showChange, setShowChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/auth/me");
        setInfo(res.data);
      } catch (e) {
        if (e?.response?.status === 401) window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword)
      return alert("Nhập đầy đủ các trường mật khẩu");
    if (newPassword.length < 6)
      return alert("Mật khẩu mới tối thiểu 6 ký tự");
    if (newPassword !== confirmPassword)
      return alert("Xác nhận mật khẩu không khớp");

    try {
      setChanging(true);
      await axiosClient.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      alert("Đổi mật khẩu thành công");
      resetForm();
      setShowChange(false);
    } catch (e) {
      alert(e?.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setChanging(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="pf-wrap">

        {loading ? (
          <div className="pf-loading">Đang tải...</div>
        ) : (
          <div className="pf-card pf-hero-card">
        <div className="pf-hero">THÔNG TIN TÀI KHOẢN</div>

            
            <div className="pf-row">
              <span>Username:</span>
              <b>{info?.username}</b>
            </div>
            <div className="pf-row">
              <span>Email:</span>
              <b className="pf-accent">{info?.email}</b>
            </div>
            <div className="pf-row">
              <span>Ngày tạo:</span>
              <b>{moment(info?.createdAt).format("DD/MM/YYYY HH:mm")}</b>
            </div>
            <div className="pf-row">
              <span>Tổng bài viết:</span>
              <b>{info?.totalTexts ?? 0}</b>
            </div>

           
            {!showChange && (
              <div className="pf-center mt-16">
                <button
                  className="pf-btn pf-btn-danger pf-btn-xl"
                  onClick={() => setShowChange(true)}
                  type="button"
                >
                  <span className="lock">🔒</span> Đổi mật khẩu
                </button>
              </div>
            )}

          
            <div className={`pf-change ${showChange ? "open" : ""}`}>
              {showChange && (
                <form className="pf-form-wide" onSubmit={changePassword}>
                  <input
                    type="password"
                    className="pf-input"
                    placeholder="Mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    className="pf-input"
                    placeholder="Mật khẩu mới (≥ 6 ký tự)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    className="pf-input"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <div className="pf-actions pf-center">
                    <button
                      className="pf-btn pf-btn-primary pf-btn-xl"
                      disabled={changing}
                      type="submit"
                    >
                      {changing ? "Đang đổi..." : "Xác nhận"}
                    </button>
                    <button
                      type="button"
                      className="pf-btn pf-btn-muted pf-btn-xl"
                      onClick={() => {
                        resetForm();
                        setShowChange(false);
                      }}
                      disabled={changing}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
