import { useEffect } from "react";

// Injects only font import + minimal base resets that are safe alongside App.css.
// Does NOT redeclare CSS variables — those live exclusively in App.css to avoid
// conflicts (previously this file set --bg/--card-bg etc. which overrode App.css
// dark-mode variables and broke theming).
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');

html, body, #root {
  height: 100%;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'Ubuntu', var(--bb-font-body, sans-serif);
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
