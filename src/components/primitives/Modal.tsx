import { createPortal } from "react-dom";
import "./Modal.css";

// Rendered via a React portal so it always escapes any parent stacking context
// (e.g. the bb-view-animate div whose CSS animation would otherwise trap
// position:fixed children and prevent true viewport centering).
export function Modal({ title, onClose, children }) {
  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
