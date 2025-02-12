import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import ProfileHeader from "./Profile/ProfileHeader";
import CreditManagement from "./Profile/CreditManagement";
import GenerationHistory, { Generation } from "./Profile/GenerationHistory";
import CreditHistory, { CreditTransaction } from "./Profile/CreditHistory";

const Profile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [stats, setStats] = useState({
    totalGenerated: 0,
    creditsEarned: 0,
    creditsSpent: 0,
  });

  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        await Promise.all([loadGenerations(), loadTransactions(), loadStats()]);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    const { data: genCount } = await supabase
      .from("generations")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .is("deleted_at", null);

    const { data: txns } = await supabase
      .from("credit_transactions")
      .select("amount, type")
      .eq("user_id", user.id);

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
    if (!user) return;

    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setGenerations(data);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
  };

  const handleDeleteGeneration = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generations")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user?.id);

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

  if (!user || !profile || loading) {
    return (
      <div className="min-h-screen bg-[#13111C] pt-20 px-4 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13111C] pt-24 px-0 sm:px-4 pb-safe">
      <div className="container mx-auto max-w-6xl space-y-4 sm:space-y-6 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="col-span-1 lg:col-span-2">
            <ProfileHeader />
          </div>
          <div className="col-span-1 space-y-6">
            <Link
              to="/credits"
              className="block w-full p-6 bg-[#1A1625] border border-purple-300/20 rounded-lg hover:bg-[#1F1A29] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Credits</h3>
                  <p className="text-purple-200/60">Manage your credits</p>
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {profile?.credits || 0}
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <GenerationHistory
            generations={generations}
            onDelete={handleDeleteGeneration}
            onExport={handleExportHistory}
            onTweak={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
