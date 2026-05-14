import { THEME } from "../../styles/theme.js";
import "./Label.css";

export function FieldLabel({ children }) {
  return <label className="field-label">{children}</label>;
}
