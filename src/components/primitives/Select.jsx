import { useState } from "react";
import { THEME } from "../../styles/theme.js";
import "./Select.css";

export function Sel({ style, ...props }) {
  const [foc, setFoc] = useState(false);
  return (
    <select
      onFocus={() => setFoc(true)}
      onBlur={() => setFoc(false)}
      className={`sel ${foc ? "sel-focused" : ""}`}
      style={{
        borderColor: foc ? THEME.color.sage : THEME.color.border,
        background: foc ? THEME.color.white : THEME.color.cream,
        ...style,
      }}
      {...props}
    />
  );
}
