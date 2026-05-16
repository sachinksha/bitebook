import { THEME } from "../../styles/theme.js";
import "./Header.css";
import { useAuth } from "../../context/contexts";
import { useTheme } from "../../context/ThemeProvider";

const TABS = [
  { id: "log", icon: "📝", label: "Log" },
  { id: "history", icon: "📋", label: "History" },
  { id: "insights", icon: "📊", label: "Insights" },
  { id: "data", icon: "📁", label: "Data" },
];

export function Header({ streak, total, active, onSwitch }) {
  const { user, login, logout } = useAuth();
  const { theme, setTheme } = useTheme();

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
            {total > 0 && (
              <span key="total" className="header-stat">
                {total} logged
              </span>
            )}
          </div>

          <div className="header-actions">
            <label className="theme-select">
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>

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
