import { THEME } from "../../styles/theme.js";
import "./Toast.css";

export function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast.variant === "error";
  return (
    <div
      key={toast.id}
      className="toast"
      style={{
        background: isErr ? THEME.color.terra : THEME.color.sage,
      }}
    >
      {toast.msg}
    </div>
  );
}
