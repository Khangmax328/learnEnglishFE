import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import moment from "moment";
import "moment/locale/vi";
import "../styles/MyTexts.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MyTexts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});
  const [delContrib, setDelContrib] = useState({});  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 5;

  const navigate = useNavigate();

  const authUser = JSON.parse(localStorage.getItem("user") || "null");
  const myId = authUser?.id || authUser?._id;

  const load = async (p = 1) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/texts/me?page=${p}&limit=${pageSize}&cpage=1&climit=3`);
      setItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.total || 0);
      setPage(res.data.page || p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá bài viết này?")) return;
    try {
      setDeleting((s) => ({ ...s, [id]: true }));
      await axiosClient.delete(`/texts/${id}`);
      setItems((prev) => {
        const next = prev.filter((t) => t._id !== id);
        if (next.length === 0 && page > 1) setTimeout(() => load(page - 1), 0);
        return next;
      });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Xoá thất bại");
    } finally {
      setDeleting((s) => ({ ...s, [id]: false }));
    }
  };

  const deleteContribution = async (textId, cid) => {
    if (!window.confirm("Xóa góp ý này?")) return;
    try {
      setDelContrib((s) => ({ ...s, [cid]: true }));
      await axiosClient.delete(`/texts/${textId}/contributions/${cid}`);

      setItems((prev) =>
        prev.map((t) => {
          if (t._id !== textId) return t;
          const nextContribs = (t.contributions || []).filter((c) => c._id !== cid);
          const hasTotal = typeof t?.contrib?.total === "number";
          const nextTotal = hasTotal ? Math.max(0, (t.contrib.total || 0) - 1) : undefined;
          return {
            ...t,
            contributions: nextContribs,
            contrib: hasTotal ? { ...t.contrib, total: nextTotal } : t.contrib,
          };
        })
      );
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Xoá góp ý thất bại");
    } finally {
      setDelContrib((s) => ({ ...s, [cid]: false }));
    }
  };

  useEffect(() => { load(1); }, []);

  return (
    <>
      <Navbar />
      <div className="my-wrap">
        <h2 className="home-title">
          Bài viết của tôi {totalItems > 0 && `(${totalItems})`}
        </h2>

        {loading ? (
          <Skeleton />
        ) : items.length === 0 ? (
          <p>Bạn chưa có bài viết nào.</p>
        ) : (
          <>
            {items.map((t) => (
              <div
                key={t._id}
                className="my-card"
                onClick={() => navigate(`/texts/${t._id}`)}
              >
                <div className="my-usertext">{t.userText}</div>

                {t.correctedText && (
                  <div className="my-ai">
                    ✅ AI: {t.correctedText}
                    {t.correctedTextVi && <div className="ai-vi">🇻🇳 {t.correctedTextVi}</div>}
                  </div>
                )}

                <div className="my-meta">
                  {moment(t.createdAt).format("DD/MM/YYYY HH:mm")}
                </div>

                <div className="my-contrib">
                  <div className="my-contrib-head">
                    Góp ý ({t?.contrib?.total ?? t?.contributions?.length ?? 0})
                  </div>

                  {(t.contributions || []).length === 0 ? (
                    <div className="my-contrib-empty">Chưa có góp ý.</div>
                  ) : (
                    (t.contributions || []).map((c) => {
                      const isMine = (c.user?._id && c.user._id === myId) || (c.user?.id && c.user.id === myId);
                      return (
                        <div key={c._id} className="my-contrib-item">
                          • <b>{c.user?.username || "unknown"}</b>: {c.suggestion}{" "}
                          <i>({moment(c.createdAt).fromNow()})</i>
                          {isMine && (
                            <button
                              className="contrib-del"
                              disabled={!!delContrib[c._id]}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteContribution(t._id, c._id);
                              }}
                              title="Xóa góp ý của bạn"
                            >
                              {delContrib[c._id] ? "Đang xoá..." : "Xóa"}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}

                  {t?.contrib?.total > (t.contributions?.length || 0) && (
                    <div className="my-contrib-more">
                      (Còn {t.contrib.total - (t.contributions?.length || 0)} góp ý…)
                    </div>
                  )}
                </div>

                <div className="my-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/texts/${t._id}`)}
                  >
                    Chi tiết
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={!!deleting[t._id]}
                    onClick={() => onDelete(t._id)}
                  >
                    {deleting[t._id] ? "Đang xoá..." : "Xoá"}
                  </button>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="paginate">
                <button className="page-btn" disabled={page === 1 || loading} onClick={() => load(page - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? "active" : ""}`}
                    disabled={loading}
                    onClick={() => load(p)}
                  >
                    {p}
                  </button>
                ))}
                <button className="page-btn" disabled={page === totalPages || loading} onClick={() => load(page + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

function Skeleton() {
  return (
    <div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="my-card my-skeleton">
          <div className="sk sk-title" />
          <div className="sk sk-row" />
          <div className="sk sk-row short" />
        </div>
      ))}
    </div>
  );
}
