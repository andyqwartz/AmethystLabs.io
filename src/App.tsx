import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import Navbar from "./components/layout/Navbar";
import GenerationDashboard from "./components/dashboard/GenerationDashboard";
import Profile from "./components/dashboard/Profile";
import { useAuth } from "./contexts/auth";

function App() {
  const { user, isEmailVerified } = useAuth();

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="min-h-screen bg-[#13111C]">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={!user ? <Home /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={
              user && isEmailVerified ? (
                <GenerationDashboard />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user && isEmailVerified ? <Profile /> : <Navigate to="/" />
            }
          />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </div>
    </Suspense>
  );
}

export default App;
