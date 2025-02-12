import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/auth";
import { TempoDevtools } from "tempo-devtools";
import { initReplicate } from "./lib/replicate";
import { supabase } from "./lib/supabase";

// Initialize Tempo and Replicate
TempoDevtools.init();

// Initialize Replicate only if needed
if (!import.meta.env.VITE_TEMPO) {
  initReplicate();
}

// Set up Supabase auth persistence
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    localStorage.setItem("sb-access-token", session?.access_token || "");
    localStorage.setItem("sb-refresh-token", session?.refresh_token || "");
  } else if (event === "SIGNED_OUT") {
    localStorage.removeItem("sb-access-token");
    localStorage.removeItem("sb-refresh-token");
  }
});

// Check for existing tokens and restore session
const accessToken = localStorage.getItem("sb-access-token");
const refreshToken = localStorage.getItem("sb-refresh-token");
if (accessToken && refreshToken) {
  supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
