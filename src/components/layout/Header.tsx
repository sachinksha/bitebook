import "./Header.css";
import { useAuth } from "../../context/contexts";
import { useTheme } from "../../context/ThemeProvider";

const TABS = [
  { id: "log",      icon: "📝", label: "Log" },
  { id: "history",  icon: "📋", label: "History" },
  { id: "insights", icon: "📊", label: "Insights" },
  { id: "data",     icon: "📁", label: "Data" },
];

const THEME_ICONS = {
  system: "⚙️",
  light: "☀️",
  dark: "🌙",
};

export function Header({ streak, total, active, onSwitch }) {
  const { user, login, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const themes = ["system", "light", "dark"];
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];

  return (
    <div className="header">
      <div className="header-content">
        <div className="header-top">
          <div className="header-logo">🥗</div>
          <div className="header-title-section">
            <div className="header-title">BiteBook</div>
            <div className="header-subtitle">Your daily food log</div>
          </div>

          <div className="header-stats">
            {total > 0 && (
              <span className="header-stat">{total} logged</span>
            )}
          </div>

          <button
            className="header-theme-btn"
            onClick={() => setTheme(nextTheme)}
            title={`Switch to ${nextTheme} theme`}
          >
            {THEME_ICONS[theme]}
          </button>

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
