import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import moment from "moment";
import "moment/locale/vi";
import axiosClient from "../api/axiosClient";
import "../styles/home.css";

export default function TextDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [contribs, setContribs] = useState([]);
  const [cmeta, setCmeta] = useState({ page: 1, pageSize: 10, totalPages: 1, total: 0 });
  const [suggestion, setSuggestion] = useState("");
  const [delContrib, setDelContrib] = useState({}); 
  const [delText, setDelText] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const myId = user?.id || user?._id;

  const load = async (p = 1) => {
    const res = await axiosClient.get(`/texts/${id}?cpage=${p}&climit=${cmeta.pageSize || 10}`);
    setItem(res.data.item);
    setContribs(res.data.contributions || []);
    setCmeta(res.data.contrib);
  };

  useEffect(() => { load(1);  }, [id]);

  const addContribution = async () => {
    if (!user) return alert("Login trước đã");
    if (!suggestion.trim()) return alert("Vui lòng nhập góp ý sửa câu");

    await axiosClient.post(`/texts/${id}/contributions`, { suggestion: suggestion.trim() });
    setSuggestion("");
    await load(1);
  };

  const deleteContribution = async (cid) => {
    if (!user) return;
    if (!window.confirm("Xóa góp ý này?")) return;
    try {
      setDelContrib(s => ({ ...s, [cid]: true }));
      await axiosClient.delete(`/texts/${id}/contributions/${cid}`);
      setContribs(prev => prev.filter(c => c._id !== cid));
      setCmeta(prev => ({ ...prev, total: Math.max(0, (prev.total || 0) - 1) }));
    } catch (e) {
      alert(e?.response?.data?.message || "Xoá góp ý thất bại");
    } finally {
      setDelContrib(s => ({ ...s, [cid]: false }));
    }
  };

  const deleteText = async () => {
    if (!user) return;
    if (!window.confirm("Bạn có chắc muốn xoá bài viết này?")) return;
    try {
      setDelText(true);
      await axiosClient.delete(`/texts/${id}`);
      navigate("/", { replace: true });
    } catch (e) {
      setDelText(false);
      alert(e?.response?.data?.message || "Xoá bài viết thất bại");
    }
  };

  if (!item) return <div className="home-wrap">Đang tải...</div>;

  const isMyText =
    (item.user?._id && item.user._id === myId) ||
    (item.user?.id && item.user.id === myId);

  return (
    <div className="home-wrap">
      <h2 className="home-title">Chi tiết bài viết</h2>

      <div className="card">
        <div className="item-head">
          <div className="avatar">{(item.user?.username || "?")[0]?.toUpperCase()}</div>
          <div className="username">{item.user?.username || "unknown"}</div>
          <div className="meta">
            <div className="created">{moment(item.createdAt).format("DD/MM/YYYY HH:mm")}</div>
            {isMyText && (
              <button
                className="text-del"
                onClick={deleteText}
                disabled={delText}
                title="Xóa bài viết của bạn"
              >
                {delText ? "Đang xoá..." : "Xóa bài"}
              </button>
            )}
          </div>
        </div>

        <div className="userText">{item.userText}</div>

        {item.correctedText && (
          <div className="ai">
            ✅ AI: {item.correctedText}
            {item.correctedTextVi && <div className="ai-vi">🇻🇳 {item.correctedTextVi}</div>}
          </div>
        )}

        <div className="contrib">
          <b>Góp ý ({cmeta.total}):</b>
          {contribs.map(c => {
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
                    onClick={() => deleteContribution(c._id)}
                    title="Xóa góp ý của bạn"
                  >
                    {delContrib[c._id] ? "Đang xoá..." : "Xóa"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="inline-form">
          <input
            className="input"
            placeholder="Góp ý sửa câu..."
            value={suggestion}
            onChange={e => setSuggestion(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==="Enter"){ e.preventDefault(); addContribution(); } }}
          />
          <button className="btn btn-primary" onClick={addContribution}>Gửi góp ý</button>
        </div>

        <div className="card-foot">
          <Link className="link" to="/">← Quay lại danh sách</Link>
        </div>
      </div>

      <div className="paginate">
        <button className="page-btn" disabled={cmeta.page===1} onClick={()=>load(cmeta.page-1)}>‹</button>
        {Array.from({ length: cmeta.totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            className={`page-btn ${p===cmeta.page ? "active" : ""}`}
            onClick={()=>load(p)}
          >
            {p}
          </button>
        ))}
        <button className="page-btn" disabled={cmeta.page===cmeta.totalPages} onClick={()=>load(cmeta.page+1)}>›</button>
      </div>
    </div>
  );
}
