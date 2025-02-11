import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ImagePlus, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import ImageUploadCard from "./ImageUploadCard";
import AdvancedSettings from "./AdvancedSettings";

const GenerationDashboard = () => {
  const { profile } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string>();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [settings, setSettings] = useState({
    aspectRatio: "1:1",
    promptStrength: 0.8,
    numOutputs: 1,
    numInferenceSteps: 28,
    guidanceScale: 3.5,
    outputFormat: "webp",
    outputQuality: 80,
  });

  const handleImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    // Add generation logic here
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const requiredCredits = selectedImage ? 2 : 1;

  return (
    <div className="min-h-screen bg-[#13111C] pt-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Image Generation
            </h1>
            <p className="text-purple-200/60">
              Credits available: {profile?.credits || 0}
            </p>
          </div>
        </div>

        <Card className="bg-[#1A1625] border-purple-300/20">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              {selectedImage ? (
                <>
                  <ImagePlus className="w-5 h-5 text-purple-400" />
                  Image to Image
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-purple-400" />
                  Text to Image
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-6">
              <ImageUploadCard
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onRemove={() => setSelectedImage(undefined)}
              />
              <div className="w-full max-w-2xl">
                <Textarea
                  placeholder="Describe the image you want to generate..."
                  className="bg-[#13111C] border-purple-300/20 text-white min-h-[120px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <div className="w-full max-w-2xl flex flex-col items-center gap-4">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={!profile?.credits || isGenerating || !prompt}
                  onClick={handleGenerate}
                >
                  {isGenerating
                    ? "Generating..."
                    : `Generate (${requiredCredits} Credit${requiredCredits > 1 ? "s" : ""})`}
                </Button>
                {!isGenerating && (
                  <Button
                    variant="ghost"
                    className="text-purple-400 hover:text-purple-300"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Hide Parameters
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show Parameters
                      </>
                    )}
                  </Button>
                )}
                {showAdvanced && !isGenerating && (
                  <div className="w-full">
                    <AdvancedSettings
                      settings={settings}
                      onChange={handleSettingChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenerationDashboard;
