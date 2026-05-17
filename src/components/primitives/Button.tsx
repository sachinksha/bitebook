import { useState } from "react";
import { THEME } from "../../styles/theme.js";
import "./Button.css";

export function Btn({
  children,
  onClick,
  variant = "default",
  size = "md",
  full,
  disabled,
  style,
  title,
  type = "button",
}) {
  const v = {
    default: {
      bg: THEME.color.white,
      color: THEME.color.inkSoft,
      border: THEME.color.border,
      hover: THEME.color.creamDark,
    },
    primary: {
      bg: THEME.color.sage,
      color: "#fff",
      border: THEME.color.sage,
      hover: THEME.color.sageMid,
    },
    ghost: {
      bg: "transparent",
      color: THEME.color.inkMuted,
      border: "transparent",
      hover: THEME.color.sagePale,
    },
    danger: {
      bg: THEME.color.terraPale,
      color: THEME.color.terra,
      border: "#f2c4b0",
      hover: "#f8ddd3",
    },
  }[variant] || {};

  const sizeClass = `btn-size-${size}`;
  const [hov, setHov] = useState(false);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`btn btn-${variant} ${sizeClass} ${full ? "btn-full" : ""}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov && !disabled ? v.hover : v.bg,
        color: v.color,
        borderColor: v.border,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
