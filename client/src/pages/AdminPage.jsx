import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import "moment/locale/vi";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/AdminPage.css";

export default function AdminPage() {
  const me = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);
  const [tab, setTab] = useState("users"); 

  const [uItems, setUItems] = useState([]);
  const [uTotalPages, setUTotalPages] = useState(1);
  const [uPage, setUPage] = useState(1);
  const [uKeyword, setUKeyword] = useState("");
  const [uLoading, setULoading] = useState(false);
  const [uUpdating, setUUpdating] = useState({});
  const [uDeleting, setUDeleting] = useState({});
  const uPageSize = 10;

  const [tItems, setTItems] = useState([]);
  const [tTotalPages, setTTotalPages] = useState(1);
  const [tPage, setTPage] = useState(1);
  const [tLoading, setTLoading] = useState(false);
  const [tDeleting, setTDeleting] = useState({});
  const [tcDeleting, setTcDeleting] = useState({}); 
  const tPageSize = 10;

  const loadUsers = async (p = 1) => {
    try {
      setULoading(true);
      const res = await axiosClient.get(
        `/auth/users?page=${p}&limit=${uPageSize}&keyword=${encodeURIComponent(uKeyword || "")}`
      );
      setUItems(res.data.items || []);
      setUTotalPages(res.data.totalPages || 1);
      setUPage(res.data.page || p);
    } catch (e) {
      alert(e?.response?.data?.message || "Tải danh sách người dùng thất bại");
    } finally {
      setULoading(false);
    }
  };

  const loadTexts = async (p = 1) => {
    try {
      setTLoading(true);
      const res = await axiosClient.get(`/texts?page=${p}&limit=${tPageSize}&cpage=1&climit=3`);
      setTItems(res.data.items || []);
      setTTotalPages(res.data.totalPages || 1);
      setTPage(res.data.page || p);
    } catch (e) {
      alert(e?.response?.data?.message || "Tải danh sách bài viết thất bại");
    } finally {
      setTLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "users") loadUsers(1);
    else loadTexts(1);
  }, [tab]);

  const toggleAdmin = async (u, nextVal) => {
    if (me && me.id === u._id && !nextVal) {
      alert("Không thể tự bỏ quyền admin của chính mình");
      return;
    }
    try {
      setUUpdating((s) => ({ ...s, [u._id]: true }));
      await axiosClient.patch(`/auth/users/${u._id}`, { isAdmin: nextVal });
      setUItems((prev) => prev.map((x) => (x._id === u._id ? { ...x, isAdmin: nextVal } : x)));
    } catch (e) {
      alert(e?.response?.data?.message || "Cập nhật quyền thất bại");
    } finally {
      setUUpdating((s) => ({ ...s, [u._id]: false }));
    }
  };

  const removeUser = async (u) => {
    if (me && me.id === u._id) {
      alert("Không thể tự xoá chính mình");
      return;
    }
    if (!window.confirm(`Xoá người dùng "${u.username}"?`)) return;
    try {
      setUDeleting((s) => ({ ...s, [u._id]: true }));
      await axiosClient.delete(`/auth/users/${u._id}`);
      setUItems((prev) => {
        const next = prev.filter((x) => x._id !== u._id);
        if (next.length === 0 && uPage > 1) setTimeout(() => loadUsers(uPage - 1), 0);
        return next;
      });
    } catch (e) {
      alert(e?.response?.data?.message || "Xoá người dùng thất bại");
    } finally {
      setUDeleting((s) => ({ ...s, [u._id]: false }));
    }
  };

  const removeText = async (t) => {
    if (!window.confirm("Xoá bài viết này?")) return;
    try {
      setTDeleting((s) => ({ ...s, [t._id]: true }));
      await axiosClient.delete(`/texts/${t._id}`);
      setTItems((prev) => {
        const next = prev.filter((x) => x._id !== t._id);
        if (next.length === 0 && tPage > 1) setTimeout(() => loadTexts(tPage - 1), 0);
        return next;
      });
    } catch (e) {
      alert(e?.response?.data?.message || "Xoá bài viết thất bại");
    } finally {
      setTDeleting((s) => ({ ...s, [t._id]: false }));
    }
  };

  const removeContrib = async (textId, cid) => {
    const key = `${textId}:${cid}`;
    if (!window.confirm("Xoá góp ý này?")) return;
    try {
      setTcDeleting((s) => ({ ...s, [key]: true }));
      await axiosClient.delete(`/texts/${textId}/contributions/${cid}`);
      setTItems((prev) =>
        prev.map((t) =>
          t._id === textId
            ? {
                ...t,
                contributions: (t.contributions || []).filter((c) => c._id !== cid),
                contrib: {
                  ...(t.contrib || {}),
                  total: Math.max(0, (t.contrib?.total || (t.contributions?.length || 0)) - 1),
                },
              }
            : t
        )
      );
    } catch (e) {
      alert(e?.response?.data?.message || "Xoá góp ý thất bại");
    } finally {
      setTcDeleting((s) => ({ ...s, [key]: false }));
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-wrap">
        <h2 className="home-title">Quản lí hệ thống</h2>

        <div className="seg">
          <button
            className={`seg-btn ${tab === "users" ? "active" : ""}`}
            onClick={() => setTab("users")}
          >
            Người dùng
          </button>
          <button
            className={`seg-btn ${tab === "texts" ? "active" : ""}`}
            onClick={() => setTab("texts")}
          >
            Bài viết
          </button>
        </div>

        {tab === "users" ? (
          <div className="panel">
            <div className="panel-head">
              <input
                className="ipt"
                placeholder="Tìm theo username hoặc email..."
                value={uKeyword}
                onChange={(e) => setUKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadUsers(1);
                }}
              />
              <button className="btn btn-muted" onClick={() => loadUsers(1)}>
                Tìm
              </button>
            </div>

            <div className="tbl users">
              <div className="row head">
                <div className="col col-username">Username</div>
                <div className="col col-email">Email</div>
                <div className="col col-date">Ngày tạo</div>
                <div className="col col-badge">Admin</div>
                <div className="col col-actions">Hành động</div>
              </div>

              {uLoading ? (
                <div className="empty">Đang tải...</div>
              ) : uItems.length === 0 ? (
                <div className="empty">Không có người dùng</div>
              ) : (
                uItems.map((u) => {
                  const isMe = me && me.id === u._id;
                  return (
                    <div key={u._id} className="row">
                      <div className="col col-username">{u.username}</div>
                      <div className="col col-email">{u.email}</div>
                      <div className="col col-date">
                        {moment(u.createdAt).format("DD/MM/YYYY HH:mm")}
                      </div>
                      <div className="col col-badge">
                        <span className={`badge ${u.isAdmin ? "ok" : "muted"}`}>
                          {u.isAdmin ? "Admin" : "User"}
                        </span>
                      </div>
                      <div className="col col-actions">
                        {u.isAdmin ? (
                          <button
                            className="btn btn-outline"
                            title={isMe ? "Không thể tự bỏ quyền" : ""}
                            disabled={isMe || !!uUpdating[u._id]}
                            onClick={() => toggleAdmin(u, false)}
                          >
                            Bỏ Admin
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline"
                            disabled={!!uUpdating[u._id]}
                            onClick={() => toggleAdmin(u, true)}
                          >
                            Cấp Admin
                          </button>
                        )}
                        <button
                          className="btn btn-danger"
                          title={isMe ? "Không thể tự xoá" : ""}
                          disabled={isMe || !!uDeleting[u._id]}
                          onClick={() => removeUser(u)}
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {uTotalPages > 1 && (
                <div className="paginate">
                  <button
                    className="page-btn"
                    disabled={uPage === 1 || uLoading}
                    onClick={() => loadUsers(uPage - 1)}
                  >
                    ‹
                  </button>
                  {Array.from({ length: uTotalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`page-btn ${p === uPage ? "active" : ""}`}
                      disabled={uLoading}
                      onClick={() => loadUsers(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    disabled={uPage === uTotalPages || uLoading}
                    onClick={() => loadUsers(uPage + 1)}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="panel">
            <div className="panel-head">
              <div />
              <button className="btn btn-muted" onClick={() => loadTexts(1)}>
                Làm mới
              </button>
            </div>

            <div className="tbl texts">
              <div className="row head">
                <div className="col col-username">Người đăng</div>
                <div className="col col-text">Nội dung</div>
                <div className="col col-date">Ngày đăng</div>
                <div className="col col-actions">Hành động</div>
              </div>

              {tLoading ? (
                <div className="empty">Đang tải...</div>
              ) : tItems.length === 0 ? (
                <div className="empty">Không có bài viết</div>
              ) : (
                tItems.map((t) => (
                  <div key={t._id} className="row">
                    <div className="col col-username">{t.user?.username || "unknown"}</div>

                    <div className="col col-text">
                      <div className="text-user">{t.userText}</div>
                      {t.correctedText && (
                        <div className="text-ai">
                          ✅ AI: {t.correctedText}
                          {t.correctedTextVi && (
                            <div className="text-ai-vi">Dịch: {t.correctedTextVi}</div>
                          )}
                        </div>
                      )}

                      <div className="mini-contrib">
                        <div className="mini-contrib-title">
                          Góp ý ({t?.contrib?.total ?? (t.contributions?.length || 0)}):
                        </div>
                        {(t.contributions || []).length === 0 ? (
                          <div className="mini-contrib-empty">Chưa có góp ý.</div>
                        ) : (
                          (t.contributions || []).map((c) => {
                            const key = `${t._id}:${c._id}`;
                            return (
                              <div key={c._id} className="mini-contrib-item">
                                <span className="mc-user">{c.user?.username || "unknown"}</span>
                                <span className="mc-text">{c.suggestion}</span>
                                <span className="mc-time">
                                  {moment(c.createdAt).fromNow()}
                                </span>
                                <button
                                  className="btn btn-xs btn-danger"
                                  disabled={!!tcDeleting[key]}
                                  onClick={() => removeContrib(t._id, c._id)}
                                >
                                  Xoá góp ý
                                </button>
                              </div>
                            );
                          })
                        )}
                        {t?.contrib?.total > (t.contributions?.length || 0) && (
                          <div className="mini-contrib-more">
                            (còn {t.contrib.total - (t.contributions?.length || 0)} góp ý…)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col col-date">{moment(t.createdAt).format("DD/MM/YYYY HH:mm")}</div>
                    <div className="col col-actions">
                      <Link className="btn btn-outline" to={`/texts/${t._id}`}>
                        Chi tiết
                      </Link>
                      <button
                        className="btn btn-danger"
                        disabled={!!tDeleting[t._id]}
                        onClick={() => removeText(t)}
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                ))
              )}

              {tTotalPages > 1 && (
                <div className="paginate">
                  <button
                    className="page-btn"
                    disabled={tPage === 1 || tLoading}
                    onClick={() => loadTexts(tPage - 1)}
                  >
                    ‹
                  </button>
                  {Array.from({ length: tTotalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`page-btn ${p === tPage ? "active" : ""}`}
                      disabled={tLoading}
                      onClick={() => loadTexts(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    disabled={tPage === tTotalPages || tLoading}
                    onClick={() => loadTexts(tPage + 1)}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
