import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { clearLegacyData } from "./services/legacyStorage";
import "@fontsource-variable/inter";
import "./styles/index.css";

clearLegacyData();

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
