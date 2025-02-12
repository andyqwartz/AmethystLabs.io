import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import ProfileHeader from "./Profile/ProfileHeader";
import CreditManagement from "./Profile/CreditManagement";
import GenerationHistory, { Generation } from "./Profile/GenerationHistory";
import CreditHistory, { CreditTransaction } from "./Profile/CreditHistory";

const Profile = () => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [stats, setStats] = useState({
    totalGenerated: 0,
    creditsEarned: 0,
    creditsSpent: 0,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadGenerations();
    loadTransactions();
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: genCount } = await supabase
      .from("generations")
      .select("id", { count: "exact" })
      .is("deleted_at", null);

    const { data: txns } = await supabase
      .from("credit_transactions")
      .select("amount, type");

    if (txns) {
      const earned = txns
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const spent = txns
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      setStats({
        totalGenerated: genCount?.length || 0,
        creditsEarned: earned,
        creditsSpent: spent,
      });
    }
  };

  const loadGenerations = async () => {
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setGenerations(data);
    }
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
  };

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

        setAvatarUrl(publicUrl);
        await updateProfile({ avatar_url: publicUrl });
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        });
      } catch (error) {
        toast({
          title: "Error updating avatar",
          description:
            "There was an error updating your profile picture. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        email,
      });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description:
          "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuyCredits = async (amount: number, credits: number) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe not loaded");

      const { data: session } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: { amount, credits },
        },
      );

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        toast({
          title: "Payment error",
          description: result.error.message,
          variant: "destructive",
        });
      }

      setShowPaymentDialog(false);
    } catch (error) {
      toast({
        title: "Payment error",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGeneration = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generations")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setGenerations(generations.filter((g) => g.id !== id));
      toast({
        title: "Generation deleted",
        description: "The generation has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error deleting generation",
        description:
          "There was an error deleting the generation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTweakGeneration = (generation: Generation) => {
    navigate(`/dashboard?tweak=${generation.id}`);
  };

  const handleExportHistory = () => {
    try {
      const data = generations.map((g) => ({
        ...g,
        created_at: new Date(g.created_at).toLocaleString(),
      }));

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "generation-history.json";
      a.click();

      toast({
        title: "Export successful",
        description: "Your generation history has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export error",
        description:
          "There was an error exporting your generation history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const creditPackages = [
    { credits: 100, price: 5 },
    { credits: 500, price: 20 },
    { credits: 1000, price: 35 },
  ];

  return (
    <div className="min-h-screen bg-[#13111C] pt-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <ProfileHeader stats={stats} />
          <div className="space-y-6">
            <CreditManagement />
            <CreditHistory transactions={transactions} />
          </div>
        </div>

        <div className="mt-8">
          <GenerationHistory
            generations={generations}
            onDelete={handleDeleteGeneration}
            onTweak={handleTweakGeneration}
            onExport={handleExportHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
