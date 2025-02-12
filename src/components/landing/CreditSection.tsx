import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { motion } from "framer-motion";
import { DollarSign, PlayCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useState } from "react";
import RegistrationModal from "./RegistrationModal";

interface CreditOption {
  title: string;
  description: string;
  price?: string;
  type: "ads" | "purchase";
}

const defaultOptions: CreditOption[] = [
  {
    title: "Watch Ads",
    description: "Earn free credits by watching short advertisements",
    type: "ads",
  },
  {
    title: "Purchase Credits",
    description: "Buy credit packages starting from $5",
    price: "$5",
    type: "purchase",
  },
];

const CreditSection = () => {
  const { user } = useAuth();
  const [showRegModal, setShowRegModal] = useState(false);
  const [regMode, setRegMode] = useState<"login" | "register">("register");

  const handleAction = (type: "ads" | "purchase") => {
    if (!user) {
      setRegMode("register");
      setShowRegModal(true);
      return;
    }
  };

  return (
    <>
      <RegistrationModal
        isOpen={showRegModal}
        onOpenChange={setShowRegModal}
        defaultMode={regMode}
      />
      <section className="w-full min-h-[500px] bg-gradient-to-b from-[#2D2438]/30 to-[#1F1A29]/50 backdrop-blur-lg py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-purple-50 mb-4">
              Get Credits
            </h2>
            <p className="text-xl text-purple-200/80">
              Choose how you want to earn credits
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {defaultOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full bg-white/5 backdrop-blur-sm border-purple-300/20 hover:border-purple-300/40 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-purple-50">
                      {option.type === "ads" ? (
                        <PlayCircle className="w-6 h-6 text-purple-400" />
                      ) : (
                        <DollarSign className="w-6 h-6 text-purple-400" />
                      )}
                      {option.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200/80 mb-6">
                      {option.description}
                    </p>
                    {option.price && (
                      <div className="mb-6">
                        <span className="text-3xl font-bold text-purple-300">
                          {option.price}
                        </span>
                        <span className="text-purple-300/60 ml-2">
                          per package
                        </span>
                      </div>
                    )}
                    <Separator className="my-6 bg-purple-300/20" />
                    <Button
                      onClick={() => handleAction(option.type)}
                      variant="secondary"
                      className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-100"
                    >
                      {option.type === "ads" ? "Watch Ads" : "Purchase Now"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default CreditSection;
