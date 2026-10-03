import React from "react";
import ReactDOM from "react-dom/client";
import "katex/dist/katex.min.css";
import "./styles/tokens.css";
import "./styles/typography.css";
import "./styles/lattice.css";
import "./styles/liquid-glass.css";
import "./styles/app.css";
import "./styles/course-expansion.css";
import "./styles/motion-hierarchy.css";
import "./styles/shared-material.css";
import "./styles/chapter-menu.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
);
