import React from "react";
import { Card, CardContent } from "../ui/card";
import CreditManagement from "./CreditManagement";
import CreditHistory from "./Profile/CreditHistory";
import { useAuth } from "@/contexts/auth";

const Credits = () => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#13111C] pt-20 px-4 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13111C] pt-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="space-y-6">
          <CreditManagement />
          <CreditHistory transactions={[]} />
        </div>
      </div>
    </div>
  );
};

export default Credits;
