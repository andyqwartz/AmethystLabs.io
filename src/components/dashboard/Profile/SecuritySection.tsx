import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const SecuritySection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRequestMFA = async () => {
    try {
      const { error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (error) throw error;

      toast({
        title: "MFA Setup",
        description:
          "Please follow the instructions in your email to complete MFA setup.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate MFA setup. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-[#1A1625] border-purple-300/20">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-white">
              Current Password
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-[#13111C] border-purple-300/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-white">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-[#13111C] border-purple-300/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-white">
              Confirm New Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-[#13111C] border-purple-300/20 text-white"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </Button>
        </form>

        <div className="pt-4 border-t border-purple-300/10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-purple-200/60">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRequestMFA}
              className="bg-[#13111C] border-purple-300/20 text-white hover:bg-purple-500/10"
            >
              <Key className="w-4 h-4 mr-2" />
              Setup 2FA
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySection;
