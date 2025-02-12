import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthCallback from "./components/auth/AuthCallback";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import AdminDashboard from "./components/admin/AdminDashboard";
import ModeratorDashboard from "./components/moderator/ModeratorDashboard";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useRoutes,
  Outlet,
} from "react-router-dom";
import Home from "./components/home";
import Navbar from "./components/layout/Navbar";
import GenerationDashboard from "./components/dashboard/GenerationDashboard";
import Profile from "./components/dashboard/Profile";
import Credits from "./components/dashboard/Credits";
import { useAuth } from "./contexts/auth";
import routes from "tempo-routes";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { user, profile } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

function App() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle initial route based on auth state
  useEffect(() => {
    if (!loading) {
      if (user && profile) {
        // User is authenticated, redirect based on role if on root
        if (location.pathname === "/") {
          const redirectPath =
            profile.role === "admin"
              ? "/admin"
              : profile.role === "moderator"
                ? "/mod"
                : "/dashboard";
          navigate(redirectPath, { replace: true });
        }
      }
    }
  }, [loading, user, profile, location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2D2438] via-[#1F1A29] to-[#13111C] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2D2438] via-[#1F1A29] to-[#13111C] overflow-x-hidden pt-safe pb-safe pl-safe pr-safe">
      <Navbar />
      <Routes>
        {/* Auth callback must be first */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Main routes */}
        <Route path="/" element={<Home />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<GenerationDashboard />} />
        </Route>
        <Route path="/profile" element={<ProtectedRoute />}>
          <Route index element={<Profile />} />
        </Route>
        <Route path="/credits" element={<ProtectedRoute />}>
          <Route index element={<Credits />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["admin"]} />}
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* Moderator Routes */}
        <Route
          path="/mod"
          element={<ProtectedRoute allowedRoles={["admin", "moderator"]} />}
        >
          <Route index element={<ModeratorDashboard />} />
        </Route>

        {/* Tempo Routes */}
        {import.meta.env.VITE_TEMPO && (
          <>
            <Route path="/tempobook/*" />
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </>
        )}

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
