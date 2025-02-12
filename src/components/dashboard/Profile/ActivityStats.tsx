import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, TrendingUp, Award, Zap, Target } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface ActivityStatsProps {
  stats: {
    totalGenerated: number;
    creditsEarned: number;
    creditsSpent: number;
    adViewsCount: number;
    lastAdView: string | null;
    bonusPoints: number;
    lastGeneration?: string;
    successRate?: number;
    averageCreditsPerDay?: number;
  };
}

const ActivityStats = ({ stats }: ActivityStatsProps) => {
  const nextTierProgress = ((stats.totalGenerated % 100) / 100) * 100;
  const currentTier = Math.floor(stats.totalGenerated / 100);
  const tierNames = ["Novice", "Apprentice", "Artist", "Master", "Grandmaster"];
  const currentTierName =
    tierNames[Math.min(currentTier, tierNames.length - 1)];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Generation Tier */}
      <Card className="bg-[#1A1625] border-purple-300/20 col-span-full xl:col-span-1">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-purple-200/60">Generation Tier</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-white">
                  {currentTierName}
                </h3>
                <Badge className="bg-purple-500/20 text-purple-400">
                  Level {currentTier + 1}
                </Badge>
              </div>
              <p className="text-sm text-purple-200/60">
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

      {/* Generation Stats */}
      <Card className="bg-[#1A1625] border-purple-300/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-200/60">Total Generated</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.totalGenerated}
              </h3>
              {stats.lastGeneration && (
                <p className="text-sm text-purple-200/60 mt-2">
                  Last generated{" "}
                  {formatDistanceToNow(new Date(stats.lastGeneration), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Activity */}
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
              {stats.averageCreditsPerDay !== undefined && (
                <p className="text-sm text-purple-200/60 mt-2">
                  ~{stats.averageCreditsPerDay.toFixed(1)} credits/day
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card className="bg-[#1A1625] border-purple-300/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-200/60">Success Rate</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.successRate ? `${stats.successRate.toFixed(1)}%` : "N/A"}
              </h3>
              <p className="text-sm text-purple-200/60 mt-2">
                Generation success rate
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Engagement */}
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
                  ? `Last viewed ${formatDistanceToNow(new Date(stats.lastAdView), { addSuffix: true })}`
                  : "No ads viewed yet"}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bonus Points */}
      <Card className="bg-[#1A1625] border-purple-300/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-200/60">Bonus Points</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.bonusPoints}
              </h3>
              <p className="text-sm text-purple-200/60 mt-2">
                Earned from promotions & rewards
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityStats;
