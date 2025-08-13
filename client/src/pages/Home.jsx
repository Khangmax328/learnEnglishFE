import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import "moment/locale/vi";
import axiosClient from "../api/axiosClient";
import "../styles/home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const [items, setItems] = useState([]);
  const [userText, setUserText] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [posting, setPosting] = useState({});
  const [delContrib, setDelContrib] = useState({});
  const [delText, setDelText] = useState({});

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const myId = user?.id || user?._id;

  const load = async (p = 1, scrollTop = true) => {
    try {
      setLoadingList(true);
      const res = await axiosClient.get(`/texts?page=${p}&limit=${pageSize}&cpage=1&climit=3`);
      setItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || p);

      // Lưu cache vào sessionStorage
      sessionStorage.setItem(
        "homeCache",
        JSON.stringify({
          items: res.data.items || [],
          totalPages: res.data.totalPages || 1,
          page: res.data.page || p,
        })
      );

      if (scrollTop) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  // Lấy cache khi vào lại trang
  useEffect(() => {
    const cache = sessionStorage.getItem("homeCache");
    if (cache) {
      const parsed = JSON.parse(cache);
      setItems(parsed.items || []);
      setTotalPages(parsed.totalPages || 1);
      setPage(parsed.page || 1);
    } else {
      load(1);
    }
  }, []);

  // Khôi phục vị trí cuộn
  useEffect(() => {
    const savedPos = sessionStorage.getItem("homeScrollY");
    if (savedPos) {
      window.scrollTo(0, parseInt(savedPos, 10));
    }
    const onScroll = () => {
      sessionStorage.setItem("homeScrollY", window.scrollY.toString());
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const createText = async (e) => {
    e.preventDefault();
    if (!user) return alert("Login trước đã");
    if (!userText.trim()) {
      alert("Vui lòng nhập câu tiếng Anh");
      document.querySelector(".textarea")?.focus();
      return;
    }
    try {
      setCreating(true);
      await axiosClient.post("/texts", { userText });
      setUserText("");
      await load(1);
    } catch (e) {
      alert(e?.response?.data?.message || "Tạo bài thất bại");
    } finally {
      setCreating(false);
    }
  };

  const addContribution = async (textId, suggestion) => {
    if (!user) return alert("Login trước đã");
    if (!suggestion?.trim()) return;
    try {
      setPosting((s) => ({ ...s, [textId]: true }));
      const res = await axiosClient.post(`/texts/${textId}/contributions`, { suggestion });
      setItems((prev) =>
        prev.map((t) =>
          t._id === textId
            ? {
                ...t,
                contributions: [
                  ...(t.contributions || []),
                  { ...res.data.contribution, user: { username: user.username, _id: myId } },
                ],
                contrib: { ...(t.contrib || {}), total: (t.contrib?.total || 0) + 1 },
              }
            : t
        )
      );
    } catch (e) {
      alert(e?.response?.data?.message || "Gửi góp ý thất bại");
    } finally {
      setPosting((s) => ({ ...s, [textId]: false }));
    }
  };

  const deleteContribution = async (textId, cid) => {
    if (!user) return;
    if (!window.confirm("Xóa góp ý này?")) return;
    try {
      setDelContrib((s) => ({ ...s, [cid]: true }));
      await axiosClient.delete(`/texts/${textId}/contributions/${cid}`);
      setItems((prev) =>
        prev.map((t) => {
          if (t._id !== textId) return t;
          const nextContribs = (t.contributions || []).filter((c) => c._id !== cid);
          const hasTotal = typeof t?.contrib?.total === "number";
          return {
            ...t,
            contributions: nextContribs,
            contrib: hasTotal
              ? { ...t.contrib, total: Math.max(0, (t.contrib.total || 0) - 1) }
              : t.contrib,
          };
        })
      );
    } catch (e) {
      alert(e?.response?.data?.message || "Xoá góp ý thất bại");
    } finally {
      setDelContrib((s) => ({ ...s, [cid]: false }));
    }
  };

  const deleteText = async (textId) => {
    if (!user) return;
    if (!window.confirm("Bạn có chắc muốn xoá bài viết này?")) return;
    try {
      setDelText((s) => ({ ...s, [textId]: true }));
      await axiosClient.delete(`/texts/${textId}`);
      setItems((prev) => prev.filter((t) => t._id !== textId));
    } catch (e) {
      alert(e?.response?.data?.message || "Xoá bài viết thất bại");
    } finally {
      setDelText((s) => ({ ...s, [textId]: false }));
    }
  };

  return (
    <>
      <Navbar />
      <div className="home-wrap">
        <h2 className="home-title">Danh sách bài viết</h2>

        <form onSubmit={createText} className="create-card">
          <textarea
            className="textarea"
            placeholder="Viết câu tiếng Anh..."
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            disabled={creating}
          />
          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? <span className="spinner"></span> : "Tạo bài (AI sẽ sửa)"}
            </button>
            <button
              className="btn btn-muted"
              type="button"
              onClick={() => setUserText("")}
              disabled={creating}
            >
              Xóa
            </button>
          </div>
        </form>

        {loadingList ? (
          <div className="list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card skeleton">
                <div className="item-head">
                  <div className="avatar shimmer"></div>
                  <div className="username shimmer w-120"></div>
                  <div className="created shimmer w-80"></div>
                </div>
                <div className="shimmer h-14 w-100"></div>
                <div className="shimmer h-10 w-70" style={{ marginTop: 12 }}></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="list">
              {items.map((t) => {
                const isMyText =
                  (t.user?._id && t.user._id === myId) ||
                  (t.user?.id && t.user.id === myId);

                return (
                  <div key={t._id} className="card">
                    <div className="item-head">
                      <div className="avatar">{(t.user?.username || "?")[0]?.toUpperCase()}</div>
                      <div className="username">{t.user?.username || "unknown"}</div>
                      <div className="meta">
                        <div className="created">{moment(t.createdAt).format("DD/MM/YYYY HH:mm")}</div>
                        {isMyText && (
                          <button
                            className="text-del"
                            disabled={!!delText[t._id]}
                            onClick={() => deleteText(t._id)}
                            title="Xóa bài viết của bạn"
                          >
                            {delText[t._id] ? "Đang xoá..." : "Xóa bài"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="userText" style={isMyText ? { color: "blue" } : {}}>
                      {t.userText}
                    </div>

                    {t.correctedText && (
                      <div className="ai-box">
                        <div className="ai-text">
                          ✅ AI: {t.correctedText}
                          {t.correctedTextVi && <div className="ai-vi">Dịch: {t.correctedTextVi}</div>}
                        </div>
                        <button
                          className="speak-btn"
                          title="Nghe phát âm"
                          onClick={() => {
                            const utterance = new SpeechSynthesisUtterance(t.correctedText);
                            utterance.lang = "en-US";
                            speechSynthesis.speak(utterance);
                          }}
                        >
                          🔊
                        </button>
                      </div>
                    )}

                    <div className="contrib">
                      <b>Góp ý ({t?.contrib?.total ?? (t.contributions?.length || 0)}):</b>
                      {(t.contributions || []).map((c) => {
                        const isMine =
                          (c.user?._id && c.user._id === myId) ||
                          (c.user?.id && c.user.id === myId);

                        return (
                          <div key={c._id} className="contrib-item">
                            • <b>{c.user?.username}</b>: {c.suggestion}{" "}
                            <i>({moment(c.createdAt).fromNow()})</i>
                            {isMine && (
                              <button
                                className="contrib-del"
                                disabled={!!delContrib[c._id]}
                                onClick={() => deleteContribution(t._id, c._id)}
                                title="Xóa góp ý của bạn"
                              >
                                {delContrib[c._id] ? "Đang xoá..." : "Xóa"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {t?.contrib?.total > (t.contributions?.length || 0) && (
                        <div className="contrib-item" style={{ color: "#6b7280" }}>
                          (còn {t.contrib.total - (t.contributions?.length || 0)} góp ý…)
                        </div>
                      )}
                    </div>

                    <div className="card-foot">
                      <Link className="link" to={`/texts/${t._id}`}>
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="paginate">
              <button
                className="page-btn"
                disabled={page === 1 || loadingList}
                onClick={() => load(page - 1)}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${p === page ? "active" : ""}`}
                  disabled={loadingList}
                  onClick={() => load(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={page === totalPages || loadingList}
                onClick={() => load(page + 1)}
              >
                ›
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
