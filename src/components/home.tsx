import React, { useState } from "react";
import Hero from "./landing/Hero";
import FeatureGrid from "./landing/FeatureGrid";
import CreditSection from "./landing/CreditSection";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Shield } from "lucide-react";
import AdminLoginModal from "./admin/AdminLoginModal";

const Home = () => {
  const [showAdminModal, setShowAdminModal] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-[#2D2438] via-[#1F1A29] to-[#13111C]"
    >
      <main className="relative pt-16">
        <Hero />

        <section id="features" className="scroll-mt-20">
          <FeatureGrid />
        </section>

        <section id="pricing" className="scroll-mt-20">
          <CreditSection />
        </section>

        <section id="about" className="scroll-mt-20 py-24 bg-[#1A1625]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                About AmethystLabs
              </h2>
              <p className="text-lg text-white/60 mb-8">
                AmethystLabs is a cutting-edge AI image generation platform that
                combines powerful machine learning with an intuitive user
                interface to help you create stunning artwork effortlessly.
              </p>
              <p className="text-lg text-white/60">
                Our platform leverages state-of-the-art AI models and provides a
                seamless experience for both beginners and professionals. With
                features like reference image uploads and our unique Tweak
                functionality, you have complete control over your creative
                process.
              </p>
            </div>
          </div>
        </section>
        <div className="flex justify-center py-12">
          <Button
            variant="outline"
            size="lg"
            className="bg-[#13111C] border-purple-300/20 text-white hover:bg-purple-500/10 gap-2"
            onClick={() => setShowAdminModal(true)}
          >
            <Shield className="w-5 h-5 text-purple-400" />
            Admin Access
          </Button>
        </div>
      </main>

      <AdminLoginModal
        isOpen={showAdminModal}
        onOpenChange={setShowAdminModal}
      />
    </motion.div>
  );
};

export default Home;
