import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import TextDetail from "./pages/TextDetail";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Profile from "./pages/Profile";
import MyTexts from "./pages/MyTexts";
import AdminPage from "./pages/AdminPage";         
import { getToken, isTokenExpired } from "./utils/auth";

function Protected({ children }) {
  const token = getToken();
  if (!token || isTokenExpired()) return <Navigate to="/login" replace />;
  return children;
}
function ProtectedAdmin({ children }) {
  const token = getToken();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!token || isTokenExpired() || !user?.isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/texts/:id"
          element={
            <Protected>
              <TextDetail />
            </Protected>
          }
        />

        <Route
          path="/my-texts"
          element={
            <Protected>
              <MyTexts />
            </Protected>
          }
        />

        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <AdminPage />
            </ProtectedAdmin>
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
