import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Github, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Alert, AlertDescription } from "../ui/alert";

interface RegistrationModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const RegistrationModal = ({
  isOpen = true,
  onOpenChange,
}: RegistrationModalProps) => {
  const { register, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (mode === "register") {
      const { error, needsVerification } = await register(email, password);
      if (error) {
        setError(error.message);
      } else if (needsVerification) {
        setIsVerificationSent(true);
      }
    } else {
      const { error } = await login(email, password);
      if (error) {
        setError(error.message);
      } else {
        onOpenChange?.(false);
      }
    }
  };

  if (isVerificationSent) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] bg-gray-900/95 backdrop-blur-lg border-purple-300/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-purple-50">
              Verify Your Email
            </DialogTitle>
            <DialogDescription className="text-center text-purple-200/80 mt-4">
              We've sent a verification link to {email}. Please check your inbox
              and click the link to verify your account.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Get Started
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-gray-900/95 backdrop-blur-lg border-purple-300/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-purple-50">
            {mode === "login" ? "Welcome Back" : "Join AmethystLabs.io"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-purple-100">
                Email
              </Label>
              <Input
                id="email"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800/50 border-purple-300/20 text-purple-50 placeholder:text-purple-200/30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-purple-100">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="bg-gray-800/50 border-purple-300/20 text-purple-50 placeholder:text-purple-200/30"
              />
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleSubmit}
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </div>

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
            >
              <Github className="mr-2 h-4 w-4" />
              Github
            </Button>
            <Button
              variant="outline"
              className="bg-gray-800/50 border-purple-300/20 text-purple-50 hover:bg-gray-700/50"
            >
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>

          {mode === "register" ? (
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
          ) : (
            <p className="text-center text-sm text-purple-300/60">
              Don't have an account?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationModal;
