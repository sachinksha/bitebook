import { THEME } from "../../styles/theme.js";
import "./EmptyState.css";

export function EmptyState({ icon, msg }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-msg">{msg}</div>
    </div>
  );
}
