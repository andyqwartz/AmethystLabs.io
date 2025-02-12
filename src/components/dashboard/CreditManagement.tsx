import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { CreditCard, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

// Lazy load Stripe only when needed
let stripePromise: Promise<any> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    const { loadStripe } = await import("@stripe/stripe-js");
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

const creditPackages = [
  { credits: 100, price: 5 },
  { credits: 500, price: 20 },
  { credits: 1000, price: 35 },
];

const CreditManagement = () => {
  const { profile, addCredits } = useAuth();
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const handleBuyCredits = async (amount: number, credits: number) => {
    try {
      const { data: session, error: sessionError } =
        await supabase.functions.invoke("create-checkout-session", {
          body: { amount, credits },
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

      if (sessionError) throw sessionError;
      if (!session.url) throw new Error("No checkout URL returned");

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment error",
        description: "There was an error processing your payment.",
        variant: "destructive",
      });
      setShowPaymentDialog(false);
    }
  };

  const handleWatchAd = async () => {
    setIsWatchingAd(true);
    // Simulate ad view - replace with actual ad integration
    setTimeout(async () => {
      try {
        await addCredits(5, "ad_watch", { ad_id: "test_ad" });
        toast({
          title: "Credits earned",
          description: "You earned 5 credits for watching the ad!",
        });
      } catch (error) {
        toast({
          title: "Error earning credits",
          description: "There was an error adding credits to your account.",
          variant: "destructive",
        });
      } finally {
        setIsWatchingAd(false);
      }
    }, 5000); // Simulate 5-second ad
  };

  return (
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
          <div className="space-y-2">
            <Dialog
              open={showPaymentDialog}
              onOpenChange={setShowPaymentDialog}
            >
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
                      onClick={() => handleBuyCredits(pkg.price, pkg.credits)}
                      className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-100"
                    >
                      {pkg.credits} Credits for ${pkg.price}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowPaymentDialog(true)}
            >
              Buy Credits
            </Button>

            <Button
              variant="outline"
              className="w-full bg-[#13111C] border-purple-300/20 text-white hover:bg-purple-500/10"
              onClick={handleWatchAd}
              disabled={isWatchingAd}
            >
              {isWatchingAd ? (
                <>
                  <Play className="w-4 h-4 mr-2 animate-pulse" />
                  Watching Ad...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Watch Ad for 5 Credits
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditManagement;
