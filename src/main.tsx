import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import App from "./App";
import "./App.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);
