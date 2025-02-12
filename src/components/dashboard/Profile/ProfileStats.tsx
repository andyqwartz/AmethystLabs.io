import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Clock, TrendingUp, Award } from "lucide-react";

interface ProfileStatsProps {
  stats: {
    totalGenerated: number;
    creditsEarned: number;
    creditsSpent: number;
    adViewsCount: number;
    lastAdView: string | null;
    bonusPoints?: number;
  };
}

const ProfileStats = ({ stats }: ProfileStatsProps) => {
  const nextTierProgress = ((stats.totalGenerated % 100) / 100) * 100; // Progress to next tier
  const currentTier = Math.floor(stats.totalGenerated / 100);
  const tierNames = ["Novice", "Apprentice", "Artist", "Master", "Grandmaster"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-[#1A1625] border-purple-300/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-200/60">Generation Tier</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {tierNames[Math.min(currentTier, tierNames.length - 1)]}
              </h3>
              <p className="text-sm text-purple-200/60 mt-2">
                {100 - (stats.totalGenerated % 100)} generations until next tier
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <Progress
            value={nextTierProgress}
            className="mt-4 bg-purple-500/10"
          />
        </CardContent>
      </Card>

      <Card className="bg-[#1A1625] border-purple-300/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-200/60">Total Generated</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.totalGenerated}
              </h3>
              <p className="text-sm text-purple-200/60 mt-2">Images Created</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1625] border-purple-300/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-200/60">Ad Engagement</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.adViewsCount}
              </h3>
              <p className="text-sm text-purple-200/60 mt-2">
                {stats.lastAdView
                  ? `Last viewed ${new Date(stats.lastAdView).toLocaleDateString()}`
                  : "No ads viewed yet"}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1625] border-purple-300/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-200/60">Credit Activity</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-green-400">
                  +{stats.creditsEarned}
                </h3>
                <span className="text-red-400">-{stats.creditsSpent}</span>
              </div>
              <p className="text-sm text-purple-200/60 mt-2">
                Net: {stats.creditsEarned - stats.creditsSpent}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
