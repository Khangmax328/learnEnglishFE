import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { getToken, clearToken, isTokenExpired } from "../utils/auth";
import { useMemo, useState, useEffect } from "react";
import "../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const token = getToken();
  const loggedIn = token && !isTokenExpired();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const initials = (user?.username || "U").slice(0, 1).toUpperCase();
  const isAdmin = !!user?.isAdmin; 
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };


  const atLogin = pathname.startsWith("/login");
  const atRegister = pathname.startsWith("/register");

  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="nav-left">
          <NavLink to="/" className="brand">Learn English</NavLink>

          <nav className="links">
            <NavLink to="/" end className="link">Trang chủ</NavLink>
          </nav>
        </div>

        <div className="nav-right">
            {loggedIn && <NavLink to="/my-texts" className="link">Bài viết của tôi</NavLink>}

          {!loggedIn ? (
            <>
              {!atLogin && (
                <NavLink to="/login" className="btn btn-light">Đăng nhập</NavLink>
              )}
              {!atRegister && (
                <NavLink to="/register" className="btn btn-light">Đăng ký</NavLink>
              )}
            </>
          ) : (
            <div className="userbox">
              <button
                className="avatar"
                onClick={() => setOpen(v => !v)}
                aria-label="Mở menu"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                {initials}
              </button>

              {open && (
                <div className="dropdown" onMouseLeave={() => setOpen(false)} role="menu">
                  <div className="dropdown-header">
                    <div className="avatar sm">{initials}</div>
                    <div className="who">
                      <div className="name">{user?.username}</div>
                      <div className="mail">{user?.email}</div>
                    </div>
                  </div>

                  <button
                    className="dd-item"
                    onClick={() => { setOpen(false); navigate("/profile"); }}
                  >
                    Hồ sơ cá nhân
                  </button>

                  {isAdmin && (
                    <button
                      className="dd-item"
                      onClick={() => { setOpen(false); navigate("/admin"); }}
                    >
                      Quản lí hệ thống
                    </button>
                  )}

                  <button className="dd-item danger" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
