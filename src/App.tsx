import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import Navbar from "./components/layout/Navbar";
import GenerationDashboard from "./components/dashboard/GenerationDashboard";
import Profile from "./components/dashboard/Profile";
import { useAuth } from "./contexts/auth";
import { supabase } from "@/lib/supabase";

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Handle auth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.slice(1));

      const accessToken =
        hash.get("access_token") || params.get("access_token");
      const refreshToken =
        hash.get("refresh_token") || params.get("refresh_token");

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    };

    if (location.pathname === "/auth/callback") {
      handleAuthCallback();
    }
  }, [location]);

  // Move useRoutes after location hook
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#13111C] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="min-h-screen bg-gradient-to-b from-[#2D2438] via-[#1F1A29] to-[#13111C]">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={!user ? <Home /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={user ? <GenerationDashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/" />}
          />
          <Route
            path="/auth/callback"
            element={<Navigate to="/dashboard" replace />}
          />
          {/* Handle error routes */}
          <Route path="/*" element={<Navigate to="/" />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={null} />
          )}
        </Routes>
        {tempoRoutes}
      </div>
      <Toaster position="top-center" />
    </Suspense>
  );
}

export default App;
