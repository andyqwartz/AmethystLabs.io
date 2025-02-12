import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import RegistrationModal from "./RegistrationModal";

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  images?: string[];
}

const defaultImages = [
  "https://images.unsplash.com/photo-1686191128892-3b37813f1b8a?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1686090656275-2eae0aa9ea02?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1686315980460-f1f92d5b1650?w=800&auto=format&fit=crop",
];

const Hero = ({
  title = "Create Stunning AI-Generated Images",
  subtitle = "Transform your ideas into beautiful artwork with our advanced AI image generation platform",
  ctaText = "Get Started",
  images = defaultImages,
}: HeroProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showRegModal, setShowRegModal] = useState(false);

  return (
    <div className="relative w-full h-[800px] overflow-hidden">
      {/* Background image grid with animation */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-3 gap-4 p-8 opacity-20 mt-16">
        {images.slice(0, 3).map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative aspect-square overflow-hidden rounded-2xl bg-purple-500/5 hidden md:block"
          >
            <img
              src={image}
              alt={`AI Generated ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold text-white mb-6"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-purple-100 mb-12"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {user ? (
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => {
                setShowRegModal(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full"
            >
              {ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </motion.div>
      </div>

      <RegistrationModal
        isOpen={showRegModal}
        onOpenChange={setShowRegModal}
        defaultMode="register"
      />
    </div>
  );
};

export default Hero;
