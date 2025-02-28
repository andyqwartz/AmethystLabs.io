import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

type UserRole = "user" | "moderator" | "admin";

interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  bio?: string;
  role: UserRole;
  credits: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
  avatar_url?: string;
  preferences: {
    theme?: "light" | "dark";
    emailNotifications?: boolean;
    autoSave?: boolean;
    showParameters?: boolean;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{
    error: any | null;
    success?: boolean;
    redirectPath?: string;
    profile?: Profile | null;
  }>;
  loginWithSocial: (
    provider: "github" | "google",
  ) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
  ) => Promise<{ error: any | null; needsVerification: boolean }>;
  isEmailVerified: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any | null }>;
  updatePreferences: (
    updates: Partial<Profile["preferences"]>,
  ) => Promise<{ error: any | null }>;
  addCredits: (
    amount: number,
    type: string,
    metadata?: any,
  ) => Promise<{ error: any | null }>;
  useCredits: (
    amount: number,
    type: string,
    metadata?: any,
  ) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPreferences = {
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
};

const createUserProfile = async (userId: string, email: string) => {
  const username = email.split("@")[0];
  const { error } = await supabase.from("profiles").insert({
    id: userId,
    email: email,
    username: username,
    role: "user",
    credits: 10,
    preferences: defaultPreferences,
  });
  return { error };
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) return { error };
      if (data) {
        setProfile(data as Profile);
        return { data };
      }
      return { error: new Error("Profile not found") };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsEmailVerified(session.user.email_confirmed_at != null);
        const { data: profile } = await fetchProfile(session.user.id);
        if (!profile) {
          await createUserProfile(session.user.id, session.user.email!);
          await fetchProfile(session.user.id);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsEmailVerified(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.session) {
        const { data: profile } = await fetchProfile(data.session.user.id);
        let redirectPath = "/dashboard";
        if (profile?.role === "admin") redirectPath = "/admin";
        else if (profile?.role === "moderator") redirectPath = "/mod";

        return { error: null, success: true, redirectPath, profile };
      }
      return { error: new Error("No session created"), success: false };
    } catch (error) {
      return { error, success: false };
    }
  };

  const loginWithSocial = async (provider: "github" | "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return {
        error,
        needsVerification: !error && !data.session,
      };
    } catch (error) {
      return { error, needsVerification: false };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) return { error: new Error("No user logged in") };
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updatePreferences = async (
    updates: Partial<Profile["preferences"]>,
  ) => {
    if (!profile?.preferences)
      return { error: new Error("No preferences found") };
    return updateProfile({
      preferences: { ...profile.preferences, ...updates },
    });
  };

  const addCredits = async (
    amount: number,
    type: string,
    metadata: any = {},
  ) => {
    if (!user?.id) return { error: new Error("No user logged in") };
    try {
      const { error } = await supabase.rpc("handle_credit_transaction", {
        p_user_id: user.id,
        p_amount: amount,
        p_type: type,
        p_metadata: metadata,
      });
      if (error) throw error;
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const useCredits = async (
    amount: number,
    type: string,
    metadata: any = {},
  ) => {
    if (!user?.id) return { error: new Error("No user logged in") };
    if (!profile?.credits || profile.credits < amount) {
      return { error: new Error("Insufficient credits") };
    }
    return addCredits(-amount, type, metadata);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        loginWithSocial,
        logout,
        register,
        isEmailVerified,
        updateProfile,
        updatePreferences,
        addCredits,
        useCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
