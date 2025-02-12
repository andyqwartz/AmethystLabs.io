import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Shield } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface AdminLoginModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminLoginModal = ({ isOpen, onOpenChange }: AdminLoginModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // First check if user exists and has admin/moderator role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) throw new Error("Failed to fetch user profile");

        if (profile?.role === "admin" || profile?.role === "moderator") {
          toast({
            title: "Login successful",
            description: "Welcome to the admin panel",
          });
          onOpenChange(false);
          navigate(profile.role === "admin" ? "/admin" : "/mod");
        } else {
          await supabase.auth.signOut(); // Sign out if not admin/moderator
          throw new Error(
            "Access denied. This portal is for administrators and moderators only.",
          );
        }
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px] bg-[#1A1625] border-purple-300/20 rounded-xl"
        description="Secure login for administrators and moderators"
      >
        <DialogHeader>
          <div className="mx-auto p-3 rounded-full bg-purple-500/10 mb-4">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-purple-50">
            Admin Access
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#13111C] border-purple-300/20 text-white"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#13111C] border-purple-300/20 text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoginModal;
