import { useState } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-root {
    min-height: 100vh;
    background: #080b12;
    display: flex;
    font-family: 'Sora', sans-serif;
    overflow: hidden;
    position: relative;
  }

  /* ── Grid overlay ── */
  .auth-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Glow blobs ── */
  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
    z-index: 0;
    animation: blobDrift 12s ease-in-out infinite alternate;
  }
  .blob-1 {
    width: 420px; height: 420px;
    background: radial-gradient(circle, rgba(56,189,248,0.13) 0%, transparent 70%);
    top: -80px; left: -80px;
  }
  .blob-2 {
    width: 340px; height: 340px;
    background: radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%);
    bottom: -60px; right: -60px;
    animation-delay: -6s;
  }
  .blob-3 {
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%);
    top: 50%; left: 60%;
    animation-delay: -3s;
  }
  @keyframes blobDrift {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(30px, 20px) scale(1.08); }
  }

  /* ── Left panel ── */
  .left-panel {
    width: 52%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 56px;
    position: relative;
    z-index: 1;
    border-right: 1px solid rgba(255,255,255,0.05);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #38bdf8, #818cf8);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    flex-shrink: 0;
  }
  .brand-name {
    font-size: 15px;
    font-weight: 600;
    color: #e2e8f0;
    letter-spacing: -0.02em;
  }

  .hero-copy {
    animation: fadeUp 0.7s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(56,189,248,0.1);
    border: 1px solid rgba(56,189,248,0.2);
    border-radius: 100px;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 600;
    color: #38bdf8;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .eyebrow-dot {
    width: 6px; height: 6px;
    background: #38bdf8;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.8); }
  }

  .hero-heading {
    font-size: 44px;
    font-weight: 700;
    color: #f1f5f9;
    line-height: 1.12;
    letter-spacing: -0.04em;
    margin-bottom: 20px;
  }
  .hero-heading .accent {
    background: linear-gradient(90deg, #38bdf8, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-sub {
    font-size: 15px;
    color: #64748b;
    line-height: 1.7;
    max-width: 380px;
    margin-bottom: 44px;
  }

  /* ── Stats row ── */
  .stats-row {
    display: flex;
    gap: 28px;
    flex-wrap: wrap;
  }
  .stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 16px 20px;
    min-width: 120px;
    animation: fadeUp 0.7s ease both;
  }
  .stat-card:nth-child(2) { animation-delay: 0.08s; }
  .stat-card:nth-child(3) { animation-delay: 0.16s; }
  .stat-num {
    font-size: 24px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.04em;
    font-family: 'JetBrains Mono', monospace;
  }
  .stat-label {
    font-size: 11px;
    color: #475569;
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 500;
  }

  /* ── Floating assessment cards ── */
  .cards-stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fadeUp 0.8s 0.1s ease both;
  }

  .assess-card {
    background: rgba(255,255,255,0.032);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: border-color 0.2s, background 0.2s;
  }
  .assess-card:hover {
    background: rgba(56,189,248,0.04);
    border-color: rgba(56,189,248,0.18);
  }
  .assess-icon {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }
  .assess-title { font-size: 13px; font-weight: 600; color: #cbd5e1; }
  .assess-sub   { font-size: 11px; color: #475569; margin-top: 1px; }
  .assess-badge {
    margin-left: auto;
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 100px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }
  .badge-green  { background: rgba(34,197,94,0.12); color: #4ade80; }
  .badge-blue   { background: rgba(56,189,248,0.12); color: #38bdf8; }
  .badge-purple { background: rgba(139,92,246,0.12); color: #a78bfa; }

  /* ── Right panel ── */
  .right-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 40px;
    position: relative;
    z-index: 1;
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
    animation: fadeUp 0.6s 0.15s ease both;
  }

  .auth-header { margin-bottom: 32px; }
  .auth-title {
    font-size: 22px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.03em;
    margin-bottom: 6px;
  }
  .auth-sub { font-size: 13px; color: #475569; line-height: 1.6; }

  /* ── Tabs ── */
  .tab-bar {
    display: flex;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 28px;
  }
  .tab-btn {
    flex: 1;
    padding: 9px 0;
    border: none;
    background: transparent;
    border-radius: 7px;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: all 0.22s ease;
    letter-spacing: -0.01em;
  }
  .tab-btn.active {
    background: rgba(56,189,248,0.14);
    color: #38bdf8;
    box-shadow: 0 0 0 1px rgba(56,189,248,0.2) inset;
  }
  .tab-btn:hover:not(.active) { color: #94a3b8; }

  /* ── Fields ── */
  .field-group { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }

  .field-wrap { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .field-inner {
    display: flex;
    align-items: center;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .field-inner:focus-within {
    border-color: rgba(56,189,248,0.4);
    box-shadow: 0 0 0 3px rgba(56,189,248,0.08);
  }
  .field-icon {
    padding: 0 14px;
    color: #334155;
    font-size: 15px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  .field-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 12px 14px 12px 0;
    font-family: 'Sora', sans-serif;
    font-size: 13.5px;
    color: #e2e8f0;
    caret-color: #38bdf8;
  }
  .field-input::placeholder { color: #334155; }

  /* ── CTA button ── */
  .cta-btn {
    width: 100%;
    padding: 13px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #0ea5e9, #6366f1);
    color: #fff;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: -0.01em;
    position: relative;
    overflow: hidden;
    transition: opacity 0.2s, transform 0.15s;
    box-shadow: 0 4px 24px rgba(14,165,233,0.25);
  }
  .cta-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .cta-btn:hover { opacity: 0.92; transform: translateY(-1px); }
  .cta-btn:hover::after { opacity: 1; }
  .cta-btn:active { transform: translateY(0); }
  .cta-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── Toast ── */
  .toast {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #1e293b;
    border: 1px solid rgba(255,255,255,0.1);
    color: #e2e8f0;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    z-index: 999;
    opacity: 0;
    animation: toastIn 0.3s ease forwards, toastOut 0.3s ease 2.5s forwards;
    white-space: nowrap;
  }
  .toast.error { border-color: rgba(239,68,68,0.3); color: #f87171; }
  .toast.success { border-color: rgba(34,197,94,0.3); color: #4ade80; }
  @keyframes toastIn  { to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  @keyframes toastOut { to { opacity: 0; transform: translateX(-50%) translateY(10px); } }

  /* ── Footer text ── */
  .auth-footer {
    text-align: center;
    margin-top: 20px;
    font-size: 11.5px;
    color: #334155;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .left-panel { display: none; }
    .right-panel { padding: 32px 20px; }
  }
`;

const ASSESS_ITEMS = [
  { icon: "🧠", bg: "rgba(56,189,248,0.1)", title: "Cognitive Aptitude", sub: "Logical reasoning & pattern recognition", badge: "Active", badgeCls: "badge-blue" },
  { icon: "⚡", bg: "rgba(139,92,246,0.1)", title: "Technical Skills",   sub: "Domain-specific competency testing",    badge: "Ready",  badgeCls: "badge-purple" },
  { icon: "✅", bg: "rgba(34,197,94,0.1)",  title: "Behavioral Index",   sub: "Personality & culture alignment score", badge: "New",    badgeCls: "badge-green" },
];

export default function Auth({ setUser }) {
  const [tab, setTab]           = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const signup = async () => {
    if (!username || !password) return showToast("Please fill in all fields.");
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/signup", null, { params: { username, password } });
      showToast("Account created! You can now log in.", "success");
      setTab("login");
    } catch { showToast("Signup failed. Try again."); }
    setLoading(false);
  };

  const login = async () => {
    if (!username || !password) return showToast("Please fill in all fields.");
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/login", null, { params: { username, password } });
      if (res.data.user_id) {
        setUser(res.data.user_id);
        localStorage.setItem("user", res.data.user_id);
      } else {
        showToast("Invalid credentials. Please try again.");
      }
    } catch { showToast("Login failed. Check your connection."); }
    setLoading(false);
  };

  const isLogin = tab === "login";

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        {/* Blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* ── Left panel ── */}
        <div className="left-panel">
          <div className="brand">
            <div className="brand-icon">M</div>
            <span className="brand-name">Multiplier AI</span>
          </div>

          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Assessment Platform
            </div>
            <h1 className="hero-heading">
              Hire smarter<br />with <span className="accent">AI-driven</span><br />assessments
            </h1>
            <p className="hero-sub">
              Evaluate candidates across cognitive, technical, and behavioral dimensions — all in one unified platform.
            </p>
            <div className="stats-row">
              {[["98%","Accuracy"], ["4.2M","Assessed"], ["340+","Companies"]].map(([n, l]) => (
                <div key={l} className="stat-card">
                  <div className="stat-num">{n}</div>
                  <div className="stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="cards-stack">
            {ASSESS_ITEMS.map(({ icon, bg, title, sub, badge, badgeCls }) => (
              <div key={title} className="assess-card">
                <div className="assess-icon" style={{ background: bg }}>{icon}</div>
                <div>
                  <div className="assess-title">{title}</div>
                  <div className="assess-sub">{sub}</div>
                </div>
                <span className={`assess-badge ${badgeCls}`}>{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="right-panel">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">{isLogin ? "Welcome back" : "Create account"}</h2>
              <p className="auth-sub">
                {isLogin
                  ? "Sign in to access your assessment dashboard."
                  : "Get started with your free account today."}
              </p>
            </div>

            {/* Tabs */}
            <div className="tab-bar">
              <button className={`tab-btn ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Login</button>
              <button className={`tab-btn ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Sign Up</button>
            </div>

            {/* Fields */}
            <div className="field-group">
              <div className="field-wrap">
                <label className="field-label">Username</label>
                <div className="field-inner">
                  <span className="field-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </span>
                  <input
                    className="field-input"
                    placeholder="your_username"
                    autoComplete="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-wrap">
                <label className="field-label">Password</label>
                <div className="field-inner">
                  <span className="field-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    className="field-input"
                    type="password"
                    placeholder="••••••••"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (isLogin ? login() : signup())}
                  />
                </div>
              </div>
            </div>

            {/* CTA */}
            <button className="cta-btn" onClick={isLogin ? login : signup} disabled={loading}>
              {loading ? "Please wait…" : isLogin ? "Sign In →" : "Create Account →"}
            </button>

            <p className="auth-footer">
              By continuing, you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div key={toast.msg} className={`toast ${toast.type}`}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}