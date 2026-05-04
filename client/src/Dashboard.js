import { useEffect, useState } from "react";
import axios from "axios";

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0B0F1A",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: "#E4E8F0",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: 60,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: "-0.3px",
    color: "#fff",
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6C63FF, #38BDF8)",
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 13,
    color: "#A0AABB",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6C63FF, #38BDF8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
    color: "#fff",
  },
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 32px",
  },
  pageHeader: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: "#F0F4FF",
    letterSpacing: "-0.5px",
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#5A6480",
    marginTop: 4,
  },
  metricsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 32,
  },
  metricCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "20px 22px",
    position: "relative",
    overflow: "hidden",
  },
  metricAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: "14px 14px 0 0",
  },
  metricLabel: {
    fontSize: 12,
    color: "#5A6480",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 600,
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: 700,
    color: "#F0F4FF",
    letterSpacing: "-0.5px",
    lineHeight: 1,
  },
  metricSub: {
    fontSize: 12,
    color: "#5A6480",
    marginTop: 6,
  },
  section: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "28px",
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#7B8DB0",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectionTitleDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
  },
  inputRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  input: {
    flex: 1,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    color: "#E4E8F0",
    outline: "none",
    transition: "border-color 0.2s, background 0.2s",
    fontFamily: "inherit",
  },
  inputFocus: {
    borderColor: "rgba(108, 99, 255, 0.6)",
    background: "rgba(108, 99, 255, 0.05)",
  },
  btn: {
    padding: "12px 22px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
    letterSpacing: "-0.1px",
    transition: "opacity 0.2s, transform 0.15s",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  btnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#3A4260",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 14,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#4A5580",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#333D5A",
  },
  linksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },
  linkCard: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    overflow: "hidden",
    transition: "border-color 0.2s, transform 0.2s",
    cursor: "default",
  },
  linkCardHover: {
    borderColor: "rgba(108, 99, 255, 0.3)",
    transform: "translateY(-2px)",
  },
  linkImg: {
    width: "100%",
    height: 160,
    objectFit: "cover",
    display: "block",
    background: "rgba(255,255,255,0.03)",
  },
  linkImgPlaceholder: {
    width: "100%",
    height: 160,
    background: "rgba(255,255,255,0.03)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2A3050",
    fontSize: 28,
  },
  linkInfo: {
    padding: "14px 16px",
  },
  linkBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#6C63FF",
    background: "rgba(108, 99, 255, 0.1)",
    border: "1px solid rgba(108, 99, 255, 0.2)",
    borderRadius: 6,
    padding: "3px 8px",
    marginBottom: 8,
  },
  linkUrl: {
    fontSize: 13,
    color: "#C0CADF",
    wordBreak: "break-all",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  linkId: {
    fontSize: 11,
    color: "#3A4260",
    marginTop: 8,
    fontFamily: "monospace",
  },
  toast: {
    position: "fixed",
    bottom: 28,
    right: 28,
    background: "#1C2035",
    border: "1px solid rgba(108,99,255,0.3)",
    borderRadius: 10,
    padding: "12px 18px",
    fontSize: 13,
    color: "#C0CADF",
    zIndex: 99,
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    animation: "slideUp 0.25s ease",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.15)",
    borderTopColor: "#6C63FF",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
};

function getInitials(str) {
  if (!str) return "U";
return String(str).slice(0, 2).toUpperCase();
}

function getDomain(url) {
  try {
    return new URL(url.startsWith("http") ? url : "https://" + url).hostname;
  } catch {
    return url;
  }
}

export default function Dashboard({ user,setUser }) {
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [toast, setToast] = useState(null);

  const logout = () => {
  localStorage.removeItem("user");
  setUser(null);
};
  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/links/${user}`);
      setLinks(res.data);
    } catch (err) {
      showToast("Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addLink = async () => {
    if (!url || adding) return;
    setAdding(true);
    try {
      await axios.post("http://127.0.0.1:8000/add-link", null, {
        params: { user_id: user, url },
      });
      setUrl("");
      showToast("Link saved successfully");
      fetchLinks();
    } catch {
      showToast("Failed to add link");
    } finally {
      setAdding(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addLink();
  };
  const T = {
  font: "'DM Sans','Segoe UI',sans-serif",
};


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #3A4260; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .link-card-anim {
          animation: fadeIn 0.3s ease both;
        }
      `}</style>

      <div style={styles.root}>
        {/* Topbar */}
        <header style={styles.topbar}>
  <div style={styles.logo}>
    <div style={styles.logoDot} />
    LinkVault
  </div>

  {/* group user chip + logout on the right */}
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={styles.userChip}>
      <div style={styles.avatar}>{getInitials(user)}</div>
      {user || "Guest"}
    </div>

    <button
      onClick={logout}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 18px", borderRadius: 8, cursor: "pointer",
        background: "#F87171", border: "none",
        color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: T.font,
        letterSpacing: "-0.1px", transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#EF4444"}
      onMouseLeave={e => e.currentTarget.style.background = "#F87171"}
    >
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <path d="M5 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2M9.5 10l3-3-3-3M12.5 7H5"
          stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Logout
    </button>
  </div>
</header>

        <main style={styles.main}>
          {/* Page header */}
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>My Link Hub</h1>
            <p style={styles.pageSubtitle}>
              Capture, preview, and organize your saved websites
            </p>
          </div>

          {/* Metrics */}
          <div style={styles.metricsRow}>
            {[
              {
                label: "Total Links",
                value: links.length,
                sub: "across all sources",
                accent: "linear-gradient(90deg, #6C63FF, #4F46E5)",
              },
              {
                label: "With Previews",
                value: links.filter((l) => l.preview).length,
                sub: "thumbnails captured",
                accent: "linear-gradient(90deg, #38BDF8, #0EA5E9)",
              },
              {
                label: "Unique Domains",
                value: new Set(links.map((l) => getDomain(l.url))).size,
                sub: "distinct websites",
                accent: "linear-gradient(90deg, #34D399, #10B981)",
              },
            ].map((m) => (
              <div key={m.label} style={styles.metricCard}>
                <div style={{ ...styles.metricAccent, background: m.accent }} />
                <div style={styles.metricLabel}>{m.label}</div>
                <div style={styles.metricValue}>
                  {loading ? (
                    <span style={{ ...styles.spinner, display: "inline-block" }} />
                  ) : (
                    m.value
                  )}
                </div>
                <div style={styles.metricSub}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Add link section */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <div
                style={{
                  ...styles.sectionTitleDot,
                  background: "#6C63FF",
                }}
              />
              Add Website
            </div>
            <div style={styles.inputRow}>
              <input
                style={{
                  ...styles.input,
                  ...(inputFocused ? styles.inputFocus : {}),
                }}
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
              <button
                style={{
                  ...styles.btn,
                  ...(!url || adding ? styles.btnDisabled : {}),
                }}
                onClick={addLink}
                disabled={!url || adding}
              >
                {adding ? (
                  <span style={styles.spinner} />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 1v12M1 7h12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {adding ? "Saving…" : "Save Link"}
              </button>
            </div>
          </div>

          {/* Saved links */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              <div
                style={{
                  ...styles.sectionTitleDot,
                  background: "#38BDF8",
                }}
              />
              Saved Links
              {links.length > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#38BDF8",
                    background: "rgba(56,189,248,0.1)",
                    border: "1px solid rgba(56,189,248,0.2)",
                    borderRadius: 6,
                    padding: "2px 8px",
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  {links.length} {links.length === 1 ? "entry" : "entries"}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div
                  style={{
                    ...styles.spinner,
                    width: 28,
                    height: 28,
                    border: "3px solid rgba(255,255,255,0.07)",
                    borderTopColor: "#6C63FF",
                    margin: "0 auto 12px",
                  }}
                />
                <p style={{ color: "#3A4260", fontSize: 13 }}>Loading links…</p>
              </div>
            ) : links.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>⬡</div>
                <div style={styles.emptyTitle}>No links saved yet</div>
                <div style={styles.emptyText}>
                  Paste a URL above and hit Save Link to get started
                </div>
              </div>
            ) : (
              <div style={styles.linksGrid}>
                {links.map((link, i) => (
                  <div
                    key={link.id}
                    className="link-card-anim"
                    style={{
                      ...styles.linkCard,
                      animationDelay: `${i * 0.05}s`,
                      ...(hoveredCard === link.id ? styles.linkCardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard(link.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {link.preview ? (
                      <img
                        src={link.preview}
                        alt="preview"
                        style={styles.linkImg}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={styles.linkImgPlaceholder}>⬡</div>
                    )}
                    <div style={styles.linkInfo}>
                      <div style={styles.linkBadge}>
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 8 8"
                          fill="currentColor"
                        >
                          <circle cx="4" cy="4" r="4" />
                        </svg>
                        {getDomain(link.url)}
                      </div>
                      <div style={styles.linkUrl}>{link.url}</div>
                      <div style={styles.linkId}>ID: {link.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div style={styles.toast}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <circle cx="7" cy="7" r="6.5" stroke="#6C63FF" />
            <path
              d="M4.5 7l2 2 3-3"
              stroke="#6C63FF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {toast}
        </div>
      )}
    </>
  );
}