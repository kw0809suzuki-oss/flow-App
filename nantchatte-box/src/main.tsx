import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  document.body.innerHTML = "<div style='padding:24px;font-family:sans-serif'>HTML到着 → root未検出</div>";
  throw new Error("#root was not found");
}

root.innerHTML = "<div style='padding:24px;font-family:sans-serif'>HTML到着 → JS起動</div>";

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (error) {
  root.innerHTML = `<div style='padding:24px;font-family:sans-serif'>HTML到着 → JS起動 → React起動失敗<br><pre style='white-space:pre-wrap'>${String(error)}</pre></div>`;
  throw error;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch(() => {});
  });
}
