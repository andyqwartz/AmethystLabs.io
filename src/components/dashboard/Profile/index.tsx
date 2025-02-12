import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import ProfileHeader from "./ProfileHeader";
import ActivityStats from "./ActivityStats";
import CreditManagement from "./CreditManagement";
import GenerationHistory from "./GenerationHistory";
import CreditHistory from "./CreditHistory";
import PreferencesSection from "./PreferencesSection";
import SecuritySection from "./SecuritySection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subDays } from "date-fns";

const Profile = () => {
  const { profile } = useAuth();
  const [generations, setGenerations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalGenerated: 0,
    creditsEarned: 0,
    creditsSpent: 0,
    adViewsCount: 0,
    lastAdView: null,
    bonusPoints: 0,
    lastGeneration: null,
    successRate: 0,
    averageCreditsPerDay: 0,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      loadUserData();
    }
  }, [profile]);

  const loadUserData = async () => {
    try {
      // Load user stats
      const { data: statsData } = await supabase.rpc("get_user_stats", {
        p_