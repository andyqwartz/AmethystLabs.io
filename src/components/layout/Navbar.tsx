import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import RegistrationModal from "../landing/RegistrationModal";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const [showRegModal, setShowRegModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#13111C]/95 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-xl font-bold text-white hover:text-purple-100 transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              AmethystLabs
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {!user ? (
                <>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection("pricing")}
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    Pricing
                  </button>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    About
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-purple-400 text-sm">
                  {profile?.credits || 0} Credits
                </span>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setShowRegModal(true)}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  Login
                </Button>
                <Button
                  onClick={() => setShowRegModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white/80 hover:text-white"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#13111C] border-t border-white/10">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {!user ? (
                <>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium text-left py-2"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection("pricing")}
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium text-left py-2"
                  >
                    Pricing
                  </button>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium text-left py-2"
                  >
                    About
                  </button>
                  <div className="flex flex-col space-y-2 pt-2 border-t border-white/10">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowRegModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-white/80 hover:text-white hover:bg-white/10 justify-start"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRegModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white justify-start"
                    >
                      Sign Up
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <div className="pt-2 border-t border-white/10">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-white/80 hover:text-white hover:bg-white/10 justify-start"
                    >
                      Logout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <RegistrationModal isOpen={showRegModal} onOpenChange={setShowRegModal} />
    </>
  );
}
