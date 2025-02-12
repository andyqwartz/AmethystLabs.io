import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface CreditTransaction {
  id: string;
  amount: number;
  type: "ad_watch" | "purchase" | "generation" | "bonus";
  metadata?: {
    stripe_payment_id?: string;
    ad_id?: string;
    generation_id?: string;
    reason?: string;
  };
  created_at: string;
}

interface CreditHistoryProps {
  transactions: CreditTransaction[];
}

const CreditHistory = ({ transactions }: CreditHistoryProps) => {
  const getTransactionLabel = (type: CreditTransaction["type"]) => {
    switch (type) {
      case "ad_watch":
        return "Ad Watch Reward";
      case "purchase":
        return "Credit Purchase";
      case "generation":
        return "Image Generation";
      case "bonus":
        return "Bonus Credits";
      default:
        return "Transaction";
    }
  };

  return (
    <Card className="bg-[#1A1625] border-purple-300/20">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-400" />
          Credit History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-[#13111C] rounded-lg border border-purple-300/10"
            >
              <div className="flex items-center gap-3">
                {transaction.amount > 0 ? (
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                ) : (
                  <div className="p-2 bg-red-500/10 rounded-full">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">
                    {getTransactionLabel(transaction.type)}
                  </p>
                  <p className="text-purple-200/60 text-sm">
                    {formatDistanceToNow(new Date(transaction.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <p
                className={`text-lg font-semibold ${transaction.amount > 0 ? "text-green-400" : "text-red-400"}`}
              >
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditHistory;
