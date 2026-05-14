import { THEME } from "../../styles/theme.js";
import "./SectionHeading.css";

export function SectionHeading({ icon, iconBg, children, aside }) {
  return (
    <div className="section-heading">
      <div className="section-heading-left">
        <span className="section-heading-icon" style={{ background: iconBg || THEME.color.sagePale }}>
          {icon}
        </span>
        <span className="section-heading-text">{children}</span>
      </div>
      {aside && <div>{aside}</div>}
    </div>
  );
}
