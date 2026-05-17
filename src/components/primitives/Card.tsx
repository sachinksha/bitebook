import { THEME } from "../../styles/theme.js";
import "./Card.css";

export function Card({ children, style }) {
  return (
    <div className="card" style={style}>
      {children}
    </div>
  );
}
