import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { motion } from "framer-motion";
import { Sparkles, Image, CreditCard, Wand2 } from "lucide-react";

interface FeatureGridProps {
  features?: Array<{
    title: string;
    description: string;
    icon: React.ElementType;
  }>;
}

const defaultFeatures = [
  {
    title: "AI Image Generation",
    description:
      "Create stunning images with our advanced AI technology. Upload reference images or start from scratch with text prompts.",
    icon: Sparkles,
  },
  {
    title: "Reference Images",
    description:
      "Upload your own images as references for generation. Our AI understands composition, style, and color palettes.",
    icon: Image,
  },
  {
    title: "Credit System",
    description:
      "Flexible credit system through ads or direct purchase. Watch short ads for free credits or buy packages for uninterrupted creation.",
    icon: CreditCard,
  },
  {
    title: "Tweak Feature",
    description:
      "Fine-tune and adjust your generated images with precision. Control every aspect of your creation with our advanced editing tools.",
    icon: Wand2,
  },
];

const FeatureGrid = ({ features = defaultFeatures }: FeatureGridProps) => {
  return (
    <div className="w-full py-24 bg-[#13111C]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Platform Features
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Discover the powerful capabilities of AmethystLabs.io, designed to
            make AI image generation accessible and powerful.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full bg-[#1A1625] border-0 hover:bg-[#1F1A29] transition-colors duration-300">
                <CardHeader className="text-center pt-8">
                  <div className="mx-auto p-3 rounded-full bg-purple-500/10 mb-4">
                    <feature.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60 text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureGrid;
