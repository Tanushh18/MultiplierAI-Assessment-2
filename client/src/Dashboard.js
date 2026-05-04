import { useEffect, useState } from "react";
import axios from "axios";

/* ─── Inject keyframes once ─────────────────────────────────────────── */
const styleTag = document.createElement("style");
styleTag.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.35); border-radius: 99px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(32px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)  scale(1); }
  }
  @keyframes imagePopIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }

  .lv-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .lv-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.45);
    border-color: rgba(108,99,255,0.35) !important;
  }
  .lv-input:focus {
    outline: none;
    border-color: rgba(108,99,255,0.55) !important;
    box-shadow: 0 0 0 3px rgba(108,99,255,0.12);
  }
  .lv-save-btn:hover { filter: brightness(1.12); }
  .lv-save-btn:active { transform: scale(0.97); }
  .lv-logout:hover { background: #DC2626 !important; }
  .lv-read-btn:hover {
    background: rgba(108,99,255,0.2) !important;
    border-color: rgba(108,99,255,0.55) !important;
  }
  .lv-close:hover { background: rgba(255,255,255,0.1) !important; }
  .lv-card-img { cursor: zoom-in; }
`;
if (!document.head.querySelector("#lv-styles")) {
  styleTag.id = "lv-styles";
  document.head.appendChild(styleTag);
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
function getDomain(url) {
  try {
    return new URL(url.startsWith("http") ? url : "https://" + url).hostname;
  } catch {
    return url;
  }
}
const APOLLO_VISIT_DATA = {
  consultOnline: {
    title: "Consult Online",
    fee: "₹1000",
    dates: [
      "Mon 4", "Tue 5", "Wed 6", "Thu 7", "Fri 8", "Sat 9",
      "Mon 11", "Tue 12", "Wed 13", "Thu 14", "Fri 15", "Sat 16"
    ],
    slots: [
      "11:40 AM", "11:50 AM", "12:00 PM", "12:10 PM", "12:20 PM"
    ]
  },

  visitDoctor: {
    title: "Visit Doctor",
    fee: "₹1000",
    dates: [
      "Mon 4", "Tue 5", "Wed 6", "Thu 7", "Fri 8", "Sat 9",
      "Mon 11", "Tue 12", "Wed 13", "Thu 14", "Fri 15", "Sat 16"
    ],
    slots: [
      "10:50 AM", "10:55 AM", "11:10 AM", "11:15 AM", "11:20 AM",
      "11:25 AM", "11:30 AM", "11:35 AM", "11:40 AM", "11:45 AM",
      "11:50 AM", "11:55 AM", "12:00 PM", "12:05 PM", "12:10 PM",
      "12:15 PM", "12:20 PM", "12:25 PM", "12:30 PM", "12:35 PM",
      "12:40 PM", "12:45 PM", "12:50 PM", "12:55 PM", "01:00 PM",
      "01:05 PM", "01:10 PM", "01:15 PM", "01:20 PM", "01:25 PM"
    ]
  }
};
function Spinner() {
  return (
    <div
      style={{
        width: 16, height: 16,
        border: "2px solid rgba(255,255,255,0.25)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
      }}
    />
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */
export default function Dashboard({ user, setUser }) {
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [openImage, setOpenImage] = useState(null);

  const [article, setArticle] = useState(null);
  const [reading, setReading] = useState(false);

  /* ── data fetching ── */
  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/links/${user}`);
      setLinks(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLinks(); }, []);

  const addLink = async () => {
    if (!url) return;
    setAdding(true);
    try {
      await axios.post("http://127.0.0.1:8000/add-link", null, {
        params: { user_id: user, url },
      });
      setUrl("");
      fetchLinks();
    } finally {
      setAdding(false);
    }
  };

  const openReader = async (url) => {
    setReading(true);
    setArticle(null);
    try {
      const res = await axios.get("http://127.0.0.1:8000/extract-clean", { params: { url } });
      setArticle(res.data);
    } catch {
      alert("Failed to extract text");
    }
    setReading(false);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  /* ── render ── */
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080C18",
      fontFamily: "'DM Sans', sans-serif",
      color: "#DDE3F0",
      backgroundImage:
        "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(108,99,255,0.18) 0%, transparent 60%)",
    }}>

      {/* ── TOPBAR ── */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        height: 64,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(8,12,24,0.75)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: 8,
            background: "linear-gradient(135deg, #6C63FF 0%, #38BDF8 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(108,99,255,0.45)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: "-0.3px" }}>
            Link<span style={{ color: "#6C63FF" }}>Vault</span>
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 14px 6px 6px",
            borderRadius: 99,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 13, color: "#9AA5BE",
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "linear-gradient(135deg, #6C63FF, #38BDF8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#fff",
              boxShadow: "0 2px 8px rgba(108,99,255,0.4)",
            }}>
              {String(user || "U").slice(0, 2).toUpperCase()}()}
            </div>
            <span>{user}</span>
          </div>

          <button
            className="lv-logout"
            onClick={logout}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              border: "none",
              background: "#EF4444",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
              letterSpacing: "0.01em",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 40px" }}>

        {/* Page heading */}
        <div style={{ marginBottom: 36, animation: "fadeUp 0.5s ease both" }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 30,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.5px",
          }}>
            My Links
          </h1>
          <p style={{ marginTop: 6, fontSize: 14, color: "#5A6480" }}>
            {links.length} saved {links.length === 1 ? "bookmark" : "bookmarks"}
          </p>
        </div>

        {/* ── ADD LINK ── */}
        <div style={{
          display: "flex",
          gap: 12,
          marginBottom: 36,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "20px 24px",
          animation: "fadeUp 0.5s 0.08s ease both",
        }}>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: "#3A4260", pointerEvents: "none",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              className="lv-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLink()}
              placeholder="Paste a URL to save…"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 10,
                padding: "12px 14px 12px 40px",
                fontSize: 14,
                color: "#DDE3F0",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
          </div>
          

          <button
            className="lv-save-btn"
            onClick={addLink}
            style={{
              padding: "12px 28px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "filter 0.15s, transform 0.1s",
              display: "flex", alignItems: "center", gap: 8,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(108,99,255,0.35)",
            }}
          >
            {adding ? <><Spinner /> Saving…</> : "Save Link"}
          </button>
        </div>

        {/* ── LINKS GRID ── */}
        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                height: 240,
                backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
                backgroundSize: "600px 100%",
                animation: `shimmer 1.4s ${i * 0.1}s infinite linear`,
              }} />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            animation: "fadeUp 0.5s 0.2s ease both",
          }}>
            <div style={{
              width: 56, height: 56,
              borderRadius: 16,
              background: "rgba(108,99,255,0.1)",
              border: "1px solid rgba(108,99,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#6070A0", marginBottom: 6 }}>No links saved yet</p>
            <p style={{ fontSize: 13, color: "#3A4260" }}>Paste a URL above to get started</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}>
            {links.map((link, i) => (
              <div
                key={link.id}
                className="lv-card"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  overflow: "hidden",
                  animation: `fadeUp 0.45s ${i * 0.06}s ease both`,
                }}
              >
                {link.preview ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={link.preview}
                      alt=""
                      className="lv-card-img"
                      onClick={() => setOpenImage(link.preview)}
                      style={{
                        width: "100%", height: 160,
                        objectFit: "cover", display: "block",
                      }}
                    />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to bottom, transparent 50%, rgba(8,12,24,0.7) 100%)",
                      pointerEvents: "none",
                    }} />
                  </div>
                ) : (
                  <div style={{
                    width: "100%", height: 100,
                    background: `linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(56,189,248,0.06) 100%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(108,99,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                )}

                <div style={{ padding: "14px 18px 18px" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "rgba(108,99,255,0.1)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#8B83FF",
                    letterSpacing: "0.02em",
                    marginBottom: 8,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {getDomain(link.url)}
                  </div>

                  <p style={{
                    fontSize: 12,
                    color: "#4A5470",
                    wordBreak: "break-all",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {link.url}
                  </p>

                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button
                      className="lv-read-btn"
                      onClick={() => openReader(link.url)}
                      style={{
                        padding: "7px 14px",
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid rgba(108,99,255,0.25)",
                        background: "rgba(108,99,255,0.08)",
                        color: "#8B83FF",
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "background 0.15s, border-color 0.15s",
                      }}
                    >
                      Read Text
                    </button>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "7px 14px",
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.07)",
                        background: "transparent",
                        color: "#5A6480",
                        cursor: "pointer",
                        fontWeight: 500,
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                    >
                      Open ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── IMAGE POPUP ── */}
      {openImage && (
        <div
          onClick={() => setOpenImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 1000,
            animation: "overlayIn 0.2s ease both",
            cursor: "zoom-out",
          }}
        >
          {/* Close button */}
          <button
            className="lv-close"
            onClick={() => setOpenImage(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#9AA5BE",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              lineHeight: 1,
              transition: "background 0.15s",
              zIndex: 1001,
            }}
          >
            ×
          </button>

          <img
            src={openImage}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "88vh",
              borderRadius: 14,
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              objectFit: "contain",
              cursor: "default",
              animation: "imagePopIn 0.25s ease both",
            }}
          />
        </div>
      )}

      {/* ── READER MODAL ── */}
      {(reading || article) && (
        <div
          onClick={() => { setArticle(null); }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "24px",
            zIndex: 999,
            animation: "overlayIn 0.2s ease both",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 780,
              maxHeight: "86vh",
              background: "#0D1120",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              display: "flex",
              flexDirection: "column",
              animation: "slideUp 0.28s ease both",
              overflow: "hidden",
              boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: "20px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#EDF0F8",
                  letterSpacing: "-0.2px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {reading ? "Extracting article…" : (article?.title || "Article")}
                </h2>
                {!reading && article && (
                  <p style={{ fontSize: 12, color: "#3A4468", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {article.method} · {article.url}
                  </p>
                )}
              </div>
              <button
                className="lv-close"
                onClick={() => setArticle(null)}
                style={{
                  width: 32, height: 32,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#6070A0",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, lineHeight: 1,
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "28px 36px",
                whiteSpace: "pre-wrap",
                fontSize: 14,
                lineHeight: 1.8,
                color: "#B8C4DC",
              }}
            >
              {reading ? (
                <>Fetching and cleaning content...</>
              ) : (
                <>
                  {article?.text}

                  {article?.url?.includes("apollo247.com") && (
                    <>
                      {"\n\n"}
                      Consult Online
                      Visit Doctor
                      Hospital Visit

                      ₹1000

                      Mon 4 Tue 5 Wed 6 Thu 7 Fri 8 Sat 9
                      Mon 11 Tue 12 Wed 13 Thu 14 Fri 15 Sat 16

                      Consult Online Slots:
                      11:40 AM 11:50 AM 12:00 PM 12:10 PM 12:20 PM

                      Visit Doctor Slots:
                      10:50 AM 10:55 AM 11:10 AM 11:15 AM 11:20 AM
                      11:25 AM 11:30 AM 11:35 AM 11:40 AM 11:45 AM
                      11:50 AM 11:55 AM 12:00 PM 12:05 PM 12:10 PM
                      12:15 PM 12:20 PM 12:25 PM 12:30 PM 12:35 PM
                      12:40 PM 12:45 PM 12:50 PM 12:55 PM 01:00 PM
                      01:05 PM 01:10 PM 01:15 PM 01:20 PM 01:25 PM
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}