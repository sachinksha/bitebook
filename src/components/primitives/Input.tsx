import { useState } from "react";
import { THEME } from "../../styles/theme.js";
import "./Input.css";

export function Inp({ list, style, ...props }) {
  const [foc, setFoc] = useState(false);
  return (
    <input
      list={list}
      onFocus={() => setFoc(true)}
      onBlur={() => setFoc(false)}
      className={`inp ${foc ? "inp-focused" : ""}`}
      style={{
        borderColor: foc ? THEME.color.sage : THEME.color.border,
        background: "var(--bb-surface-secondary)",
        boxShadow: foc ? `0 0 0 3px ${THEME.color.sageLight}55` : "none",
        ...style,
      }}
      {...props}
    />
  );
}
