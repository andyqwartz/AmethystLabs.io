import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/auth";

const PreferencesSection = () => {
  const { profile, updatePreferences } = useAuth();

  const handlePreferenceChange = async (key: string, value: any) => {
    await updatePreferences({ [key]: value });
  };

  return (
    <Card className="bg-[#1A1625] border-purple-300/20">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white">Dark Mode</Label>
            <p className="text-sm text-purple-200/60">
              Use dark theme across the application
            </p>
          </div>
          <Switch
            checked={profile?.preferences?.theme === "dark"}
            onCheckedChange={(checked) =>
              handlePreferenceChange("theme", checked ? "dark" : "light")
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white">Email Notifications</Label>
            <p className="text-sm text-purple-200/60">
              Receive updates about your generations and credits
            </p>
          </div>
          <Switch
            checked={profile?.preferences?.emailNotifications}
            onCheckedChange={(checked) =>
              handlePreferenceChange("emailNotifications", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white">Auto-Save Generations</Label>
            <p className="text-sm text-purple-200/60">
              Automatically save all generated images
            </p>
          </div>
          <Switch
            checked={profile?.preferences?.autoSave}
            onCheckedChange={(checked) =>
              handlePreferenceChange("autoSave", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white">Show Generation Parameters</Label>
            <p className="text-sm text-purple-200/60">
              Display parameters with generated images
            </p>
          </div>
          <Switch
            checked={profile?.preferences?.showParameters}
            onCheckedChange={(checked) =>
              handlePreferenceChange("showParameters", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesSection;
