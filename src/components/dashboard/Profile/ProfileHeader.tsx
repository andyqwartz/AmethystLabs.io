import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Camera,
  Edit2,
  Check,
  X,
  Mail,
  Calendar,
  Clock,
  Shield,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { supabase } from "@/lib/supabase";

interface ProfileHeaderProps {
  className?: string;
}

const ProfileHeader = ({ className }: ProfileHeaderProps) => {
  const { profile, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    secondary_email: profile?.secondary_email || "",
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileExt = file.name.split(".").pop();
        const filePath = `${profile?.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        await updateProfile({ avatar_url: publicUrl });
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update profile picture",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 hover:bg-red-500/30";
      case "moderator":
        return "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30";
      default:
        return "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30";
    }
  };

  return (
    <Card className={`bg-[#1A1625] border-purple-300/20 ${className}`}>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-purple-500/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-purple-500/20 text-purple-200 text-xl">
                {profile?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-2 -right-2 p-2 rounded-full bg-purple-600 text-white cursor-pointer
                       hover:bg-purple-700 transition-colors duration-200"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="bg-[#13111C] border-purple-300/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      className="bg-[#13111C] border-purple-300/20 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Primary Email
                    </Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="bg-[#13111C] border-purple-300/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_email" className="text-white">
                      Secondary Email
                    </Label>
                    <Input
                      id="secondary_email"
                      value={formData.secondary_email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          secondary_email: e.target.value,
                        }))
                      }
                      className="bg-[#13111C] border-purple-300/20 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="bg-[#13111C] border-purple-300/20 text-white"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="bg-[#13111C] border-purple-300/20 text-white hover:bg-purple-500/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white truncate">
                    {profile?.full_name ||
                      profile?.username ||
                      "Anonymous User"}
                  </h2>
                  <div className="flex items-center gap-2 text-purple-200/60">
                    <Mail className="w-4 h-4" />
                    {profile?.email}
                    {profile?.email_verified && (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-400 border-green-400/20"
                      >
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getRoleBadgeColor(profile?.role || "user")}>
                    <Shield className="w-4 h-4 mr-1" />
                    {profile?.role?.charAt(0).toUpperCase() +
                      profile?.role?.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-purple-500/10 text-purple-400 border-purple-400/20"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined{" "}
                    {format(new Date(profile?.created_at || ""), "MMM yyyy")}
                  </Badge>
                  {profile?.last_login && (
                    <Badge
                      variant="outline"
                      className="bg-purple-500/10 text-purple-400 border-purple-400/20"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Last seen{" "}
                      {formatDistanceToNow(new Date(profile.last_login), {
                        addSuffix: true,
                      })}
                    </Badge>
                  )}
                </div>

                {profile?.bio && (
                  <p className="text-purple-200/80 text-sm">{profile.bio}</p>
                )}

                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="bg-[#13111C] border-purple-300/20 text-white hover:bg-purple-500/10"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
