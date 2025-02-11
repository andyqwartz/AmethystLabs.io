import React, { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { User, CreditCard, History, Settings, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Profile = () => {
  const { profile, logout, updateProfile } = useAuth();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to storage and get URL
      const fakeUrl = URL.createObjectURL(file);
      setAvatarUrl(fakeUrl);
      await updateProfile({ avatar_url: fakeUrl });
    }
  };

  const handleBuyCredits = async (amount: number, credits: number) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe not loaded");

      // In a real app, create a checkout session on your backend
      console.log(`Processing payment of $${amount} for ${credits} credits`);
      setShowPaymentDialog(false);
    } catch (error) {
      console.error("Payment error:", error);
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
          {/* Main Profile Info */}
          <Card className="lg:col-span-2 bg-[#1A1625] border-purple-300/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-purple-500/20 text-purple-200 text-xl">
                      {profile?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -right-2 p-2 rounded-full bg-purple-600 text-white cursor-pointer
                             hover:bg-purple-700 transition-colors duration-200"
                  >
                    <Camera className="w-4 h-4" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {profile?.email}
                  </h3>
                  <p className="text-purple-200/60 capitalize">
                    {profile?.role}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-purple-200/60">Member Since</p>
                <p className="text-white">
                  {new Date(profile?.created_at || "").toLocaleDateString()}
                </p>
              </div>

              <Button
                onClick={() => logout()}
                variant="outline"
                className="w-full bg-[#13111C] border-purple-300/20 text-purple-100 hover:bg-purple-500/10"
              >
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Credits and Actions */}
          <div className="space-y-6">
            <Card className="bg-[#1A1625] border-purple-300/20">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {profile?.credits || 0}
                </div>
                <p className="text-purple-200/60 text-sm mb-4">
                  Available credits for generation
                </p>
                <Dialog
                  open={showPaymentDialog}
                  onOpenChange={setShowPaymentDialog}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Buy Credits
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-[#1A1625] border-purple-300/20">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-white">
                        Buy Credits
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {creditPackages.map((pkg, i) => (
                        <Button
                          key={i}
                          onClick={() =>
                            handleBuyCredits(pkg.price, pkg.credits)
                          }
                          className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-100"
                        >
                          {pkg.credits} Credits for ${pkg.price}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1625] border-purple-300/20">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Generation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-200/60 mb-4">
                  View your past generations and results
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-[#13111C] border-purple-300/20 text-purple-100 hover:bg-purple-500/10"
                >
                  View History
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1625] border-purple-300/20">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-200/60 mb-4">
                  Manage your account preferences
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-[#13111C] border-purple-300/20 text-purple-100 hover:bg-purple-500/10"
                >
                  Open Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
