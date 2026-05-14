import { chipDragRef, DRAG_TYPE } from "./constants.js";

export function parseDragPayload(dt) {
  try {
    const s = dt.getData(DRAG_TYPE) || dt.getData("text/plain");
    if (!s) return null;
    const o = JSON.parse(s);
    if (!o || o.app !== "bitebook") return null;
    return o;
  } catch {
    return null;
  }
}

export function readChipPayload(dt) {
  return parseDragPayload(dt) || chipDragRef.current;
}
