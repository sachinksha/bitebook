import { useEffect } from "react";

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');
`;

export function GlobalStyles() {
  useEffect(() => {
    if (document.getElementById("bb-styles")) return;
    const el = document.createElement("style");
    el.id = "bb-styles";
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
  }, []);
  return null;
}
