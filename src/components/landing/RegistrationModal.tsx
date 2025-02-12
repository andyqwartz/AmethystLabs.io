import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Github, Mail } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { LoginForm } from "./RegistrationModal/LoginForm";
import { RegistrationForm } from "./RegistrationModal/RegistrationForm";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface RegistrationModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: "login" | "register";
}

const RegistrationModal = ({
  isOpen = false,
  onOpenChange,
  defaultMode = "login",
}: RegistrationModalProps) => {
  const { register, login, loginWithSocial, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [verificationEmail, setVerificationEmail] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsVerificationSent(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      const { error, success, redirectPath } = await login(
        data.email,
        data.password,
      );
      if (error) {
        setError(error.message);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (success) {
        toast({
          title: "Login successful",
          description: "Redirecting to dashboard...",
        });
        onOpenChange?.(false);
        navigate(redirectPath || "/dashboard", { replace: true });
      }
    } catch (error) {
      setError("An unexpected error occurred");
    }
  };

  const handleRegister = async (data: {
    email: string;
    password: string;
    confirmPassword?: string;
  }) => {
    try {
      if (data.password !== data.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      const { error, needsVerification } = await register(
        data.email,
        data.password,
      );
      if (error) {
        setError(error.message);
      } else if (needsVerification) {
        setVerificationEmail(data.email);
        setIsVerificationSent(true);
      } else {
        onOpenChange?.(false);
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      setError("An unexpected error occurred");
    }
  };

  const handleSocialLogin = async (provider: "github" | "google") => {
    try {
      const { error } = await loginWithSocial(provider);
      if (!error) {
        onOpenChange?.(false);
      } else {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setError("An unexpected error occurred during social login");
    }
  };

  if (isVerificationSent) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] bg-gray-900/95 backdrop-blur-lg border-purple-300/20 rounded-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-purple-50">
                Verify Your Email
              </DialogTitle>
              <div className="mt-4 text-center space-y-4">
                <p className="text-purple-200/80">
                  We've sent a verification link to:
                </p>
                <p className="text-white font-medium">{verificationEmail}</p>
                <p className="text-purple-200/80">
                  Please check your inbox and click the link to verify your
                  account.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 w-full bg-[#13111C] border-purple-300/20 text-white hover:bg-purple-500/10"
                  onClick={() => {
                    setIsVerificationSent(false);
                    setMode("login");
                  }}
                >
                  Back to Login
                </Button>
              </div>
            </DialogHeader>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] bg-gray-900/95 backdrop-blur-lg border-purple-300/20 rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        description="Authentication dialog for login and registration"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-purple-50">
                {mode === "login"
                  ? "Welcome Back!"
                  : "Welcome to AmethystLabs.io"}
              </DialogTitle>
              <p className="text-center text-purple-200/60 mt-2">
                {mode === "login"
                  ? "Great to see you again! Please enter your details."
                  : "Join us and start creating amazing AI-generated artwork."}
              </p>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {mode === "login" ? (
                <LoginForm onSubmit={handleLogin} error={error} />
              ) : (
                <RegistrationForm onSubmit={handleRegister} error={error} />
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-purple-300/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-purple-300/60">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="bg-gray-800/50 border-purple-300/20 text-purple-50 hover:bg-gray-700/50"
                  onClick={() => handleSocialLogin("github")}
                >
                  <Github className="mr-2 h-4 w-4" />
                  Github
                </Button>
                <Button
                  variant="outline"
                  className="bg-gray-800/50 border-purple-300/20 text-purple-50 hover:bg-gray-700/50"
                  onClick={() => handleSocialLogin("google")}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </div>

              {mode === "register" ? (
                <div className="space-y-4">
                  <p className="text-center text-sm text-purple-300/60">
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setMode("login");
                        setError(null);
                      }}
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Sign in
                    </button>
                  </p>
                  <p className="text-center text-sm text-purple-300/60">
                    By creating an account, you agree to our{" "}
                    <a href="#" className="underline hover:text-purple-300">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="underline hover:text-purple-300">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-purple-300/60">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Sign up
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationModal;
