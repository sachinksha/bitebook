import { THEME } from "../../styles/theme.js";
import "./Header.css";
import { useAuth } from "../../context/contexts";

const TABS = [
  { id: "log", icon: "📝", label: "Log" },
  { id: "calendar", icon: "🗓", label: "Calendar" },
  { id: "history", icon: "📋", label: "History" },
  { id: "insights", icon: "📊", label: "Insights" },
  { id: "data", icon: "📁", label: "Data" },
];

export function Header({ streak, total, active, onSwitch }) {
  const { user, login, logout } = useAuth();

  return (
    <div className="header">
      <div className="header-content">
        {/* Logo + stats */}
        <div className="header-top">
          <div className="header-logo">🥗</div>
          <div className="header-title-section">
            <div className="header-title">BiteBook</div>
            <div className="header-subtitle">Your daily food log</div>
          </div>
          <div className="header-stats">
            {[`${total} meals`, streak > 0 ? `${streak}d streak 🔥` : "Start a streak!"].map(
              (t) => (
                <span key={t} className="header-stat">
                  {t}
                </span>
              )
            )}
          </div>
          <div className="header-auth">
            {user ? (
              <div className="user-info">
                <span>Welcome, {user.displayName}</span>
                <button onClick={logout} className="auth-button">Logout</button>
              </div>
            ) : (
              <button onClick={login} className="auth-button">Login with Google</button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="header-tabs">
          {TABS.map((tab) => {
            const on = tab.id === active;
            return (
              <button
                key={tab.id}
                onClick={() => onSwitch(tab.id)}
                className={`header-tab ${on ? "header-tab-active" : ""}`}
              >
                <span style={{ marginRight: 5 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
