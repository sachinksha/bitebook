import { FieldLabel } from "./Label.jsx";
import "./Field.css";

export function Field({ label, children, style }) {
  return (
    <div className="field" style={style}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}
