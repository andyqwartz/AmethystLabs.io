import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          // Check if profile exists
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!profile) {
            // Create profile if it doesn't exist
            const { error: createError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email,
                role: "user",
                credits: 10,
                preferences: {
                  theme: "dark",
                  emailNotifications: true,
                  autoSave: true,
                  showParameters: true,
                  language: "en",
                  imageQualityPreference: "high",
                  defaultAspectRatio: "1:1",
                  defaultPromptStrength: 0.8,
                  defaultNumOutputs: 1,
                  defaultNumInferenceSteps: 28,
                  defaultGuidanceScale: 3.5,
                  defaultOutputFormat: "webp",
                  defaultOutputQuality: 80,
                },
              });

            if (createError) throw createError;

            // Show welcome toast and wait before redirect
            toast({
              title: "Welcome to AmethystLabs!",
              description: "You've received 10 free credits to get started!",
            });

            // Wait for toast to be visible
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            // Update last login for existing profile
            await supabase
              .from("profiles")
              .update({ last_login: new Date().toISOString() })
              .eq("id", session.user.id);

            // Don't show welcome back toast here, it will be handled in auth context
          }

          // Redirect based on role
          const redirectPath =
            profile?.role === "admin"
              ? "/admin"
              : profile?.role === "moderator"
                ? "/mod"
                : "/dashboard";

          navigate(redirectPath, { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast({
          title: "Error",
          description: "Failed to complete authentication",
          variant: "destructive",
        });
        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2D2438] via-[#1F1A29] to-[#13111C] flex items-center justify-center">
      <div className="text-white">Completing login...</div>
    </div>
  );
};

export default AuthCallback;
