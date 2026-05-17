import { useEffect } from "react";

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');

:root {
  --bg: #ffffff;
  --card-bg: #ffffff;
  --text: #1a1714;
  --muted: #7a7068;
  --border: #ddd8cf;
  --accent: #3d6b50;
  --shadow-sm: 0 1px 4px rgba(26,23,20,0.07);
}

[data-theme="dark"] {
  --bg: #0b0b0c;
  --card-bg: #0f0f10;
  --text: #efeae6;
  --muted: #cfc6bf;
  --border: #2b2a2a;
  --accent: #5a8f6e;
  --shadow-sm: 0 6px 18px rgba(0,0,0,0.6);
}

html, body, #root {
  height: 100%;
  background: var(--bg);
  color: var(--text);
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: var(--font, 'Ubuntu', sans-serif);
}

button { cursor: pointer; }

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
