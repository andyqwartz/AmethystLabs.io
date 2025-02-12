import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any | null }>;
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

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    } else if (error) {
      console.error("Error fetching profile:", error);
      // If profile doesn't exist, create it
      if (error.code === "PGRST116") {
        const { error: createError } = await supabase.from("profiles").insert({
          id: userId,
          email: user?.email,
          role: "user",
          credits: 100,
          preferences: {},
        });
        if (!createError) {
          return fetchProfile(userId);
        }
      }
    }
    return { data, error };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsEmailVerified(session?.user?.email_confirmed_at != null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setIsEmailVerified(session?.user?.email_confirmed_at != null);

      if (session?.user) {
        const { error } = await fetchProfile(session.user.id);
        if (error && event === "SIGNED_IN") {
          console.error("Error fetching profile:", error);
        }
      } else {
        setProfile(null);
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

      if (!error && data.session) {
        setUser(data.session.user);
        await fetchProfile(data.session.user.id);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });
        navigate("/dashboard");
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const loginWithSocial = async (provider: "github" | "google") => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams:
          provider === "google"
            ? {
                access_type: "offline",
                prompt: "consent",
              }
            : undefined,
      },
    });

    if (!error && data.url) {
      window.location.href = data.url;
    }

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const register = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email,
          },
        },
      });

      if (!error && data.user) {
        toast({
          title: "Welcome to AmethystLabs!",
          description:
            "Please check your email to verify your account. You'll receive 10 free credits to start generating images!",
        });
      }

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
    setUser(null);
    setProfile(null);
    setIsEmailVerified(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) return { error: new Error("No user logged in") };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (!error) {
      await fetchProfile(user.id);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    }

    return { error };
  };

  const updatePreferences = async (
    updates: Partial<Profile["preferences"]>,
  ) => {
    if (!user?.id || !profile) return { error: new Error("No user logged in") };

    const newPreferences = { ...profile.preferences, ...updates };
    return updateProfile({ preferences: newPreferences });
  };

  const addCredits = async (
    amount: number,
    type: string,
    metadata: any = {},
  ) => {
    if (!user?.id) return { error: new Error("No user logged in") };

    const { error } = await supabase.rpc("handle_credit_transaction", {
      p_user_id: user.id,
      p_amount: amount,
      p_type: type,
      p_metadata: metadata,
    });

    if (!error) {
      await fetchProfile(user.id);
      toast({
        title: "Credits added",
        description: `${amount} credits have been added to your account.`,
      });
    }

    return { error };
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

    const { error } = await supabase.rpc("handle_credit_transaction", {
      p_user_id: user.id,
      p_amount: -amount,
      p_type: type,
      p_metadata: metadata,
    });

    if (!error) {
      await fetchProfile(user.id);
    }

    return { error };
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
