import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import AdminDashboard from "./components/admin/AdminDashboard";
import ModeratorDashboard from "./components/moderator/ModeratorDashboard";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import Home from "./components/home";
import Navbar from "./components/layout/Navbar";
import GenerationDashboard from "./components/dashboard/GenerationDashboard";
import Profile from "./components/dashboard/Profile";
import Credits from "./components/dashboard/Credits";
import { useAuth } from "./contexts/auth";

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
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle auth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      if (location.pathname.startsWith("/auth/callback")) {
        const params = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.slice(1));

        // Check for email confirmation success
        const isEmailConfirmation = params.get("type") === "email_confirmation";

        if (isEmailConfirmation) {
          toast({
            title: "Email Verified",
            description: "Your email has been verified. You can now log in.",
          });
          navigate("/", { replace: true });
          return;
        }

        // Handle OAuth callback
        const accessToken =
          hash.get("access_token") || params.get("access_token");
        const refreshToken =
          hash.get("refresh_token") || params.get("refresh_token");
        const provider = params.get("provider");

        if (accessToken && refreshToken) {
          try {
            // Set the session manually
            const {
              data: { session },
              error,
            } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;
            if (!session?.user) throw new Error("No user in session");

            // Get or create user profile
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (!existingProfile) {
              // Create new profile for social login
              const { error: insertError } = await supabase
                .from("profiles")
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  role: "user",
                  credits: 10,
                  preferences: {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  last_login: new Date().toISOString(),
                });

              if (insertError) throw insertError;

              // Fetch the newly created profile
              const { data: newProfile, error: fetchError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

              if (fetchError) throw fetchError;

              let redirectPath = "/dashboard";
              if (newProfile?.role === "admin") {
                redirectPath = "/admin";
              } else if (newProfile?.role === "moderator") {
                redirectPath = "/mod";
              }

              toast({
                title: "Welcome to AmethystLabs!",
                description: `You've received 10 free credits to get started.`,
              });

              navigate(redirectPath, { replace: true });
              return;
            }

            // Update last_login for existing profile
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ last_login: new Date().toISOString() })
              .eq("id", session.user.id);

            if (updateError) throw updateError;

            let redirectPath = "/dashboard";
            if (existingProfile.role === "admin") {
              redirectPath = "/admin";
            } else if (existingProfile.role === "moderator") {
              redirectPath = "/mod";
            }

            toast({
              title: "Welcome back!",
              description: `Successfully logged in with ${provider || "social provider"}`,
            });

            navigate(redirectPath, { replace: true });
            return;
          } catch (error) {
            console.error("Auth callback error:", error);
            toast({
              title: "Error",
              description: "Failed to complete authentication",
              variant: "destructive",
            });
            navigate("/", { replace: true });
          }
        } else {
          navigate("/", { replace: true });
        }
      }
    };

    handleAuthCallback();
  }, [location, navigate]);

  // Handle auth redirects
  useEffect(() => {
    if (user && profile) {
      // If user is logged in and trying to access home or auth routes, redirect based on role
      if (location.pathname === "/" || location.pathname.startsWith("/auth/")) {
        let redirectPath = "/dashboard";
        if (profile.role === "admin") {
          redirectPath = "/admin";
        } else if (profile.role === "moderator") {
          redirectPath = "/mod";
        }
        navigate(redirectPath, { replace: true });
      }
    } else if (!user && !location.pathname.startsWith("/auth/")) {
      // If user is not logged in and trying to access any route except auth routes, redirect to home
      if (location.pathname !== "/") {
        navigate("/", {
          replace: true,
          state: { from: location }, // Save attempted location
        });
      }
    }
  }, [user, profile, location.pathname]);

  // Handle initial auth state
  useEffect(() => {
    if (user && profile && location.pathname === "/") {
      let redirectPath = "/dashboard";
      if (profile.role === "admin") {
        redirectPath = "/admin";
      } else if (profile.role === "moderator") {
        redirectPath = "/mod";
      }
      navigate(redirectPath, { replace: true });
    }
  }, [user, profile]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2D2438] via-[#1F1A29] to-[#13111C]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/*" element={<Navigate to="/" replace />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<GenerationDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/credits" element={<Credits />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* Moderator Routes */}
        <Route
          element={<ProtectedRoute allowedRoles={["admin", "moderator"]} />}
        >
          <Route path="/mod/*" element={<ModeratorDashboard />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
