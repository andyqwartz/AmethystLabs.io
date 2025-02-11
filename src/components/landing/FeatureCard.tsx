import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { motion } from "framer-motion";
import { Sparkles, Image, CreditCard } from "lucide-react";

interface FeatureCardProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  className?: string;
}

const defaultFeatures = [
  {
    title: "AI Image Generation",
    description: "Create stunning images with our advanced AI technology",
    icon: Sparkles,
  },
  {
    title: "Reference Images",
    description: "Upload your own images as references for generation",
    icon: Image,
  },
  {
    title: "Credit System",
    description: "Flexible credit system through ads or direct purchase",
    icon: CreditCard,
  },
];

const FeatureCard = ({
  title = defaultFeatures[0].title,
  description = defaultFeatures[0].description,
  icon: Icon = defaultFeatures[0].icon,
  className = "",
}: FeatureCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`w-[380px] h-[480px] ${className}`}
    >
      <Card className="h-full bg-white/5 backdrop-blur-sm border-purple-300/20 hover:border-purple-300/40 transition-all duration-300">
        <CardHeader className="text-center pt-8">
          <div className="mx-auto p-4 rounded-full bg-purple-100/10 mb-4">
            <Icon className="w-8 h-8 text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-purple-50">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center text-purple-200/80 text-lg">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
