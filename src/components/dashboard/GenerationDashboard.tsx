import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Wand2, Settings, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import ImageUploadCard from "./ImageUploadCard";
import AdvancedSettings from "./AdvancedSettings";
import { generateImage, replicate, initReplicate } from "@/lib/replicate";
import { getPromptSuggestions, PromptSuggestion } from "@/lib/suggestions";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const GenerationDashboard = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string>();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [settings, setSettings] = useState({
    aspectRatio: "1:1",
    promptStrength: 0.8,
    numOutputs: 1,
    numInferenceSteps: 28,
    guidanceScale: 3.5,
    outputFormat: "webp",
    outputQuality: 80,
  });

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (prompt.length >= 3) {
        const newSuggestions = await getPromptSuggestions(prompt);
        setSuggestions(newSuggestions);
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [prompt]);

  const handleImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(
      "generationSettings",
      JSON.stringify({ ...settings, [key]: value }),
    );
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem("generationSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleGenerate = async () => {
    // Re-initialize Replicate if needed
    if (!replicate) {
      const token = await initReplicate();
      if (!token) {
        toast({
          title: "Error",
          description: "Failed to initialize image generation service",
          variant: "destructive",
        });
        return;
      }
    }

    if (!prompt) return;

    const requiredCredits = selectedImage ? 2 : 1;
    if (!profile?.credits || profile.credits < requiredCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${requiredCredits} credits for this generation. Please purchase more credits or watch ads to earn them.`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    let transactionId: string | null = null;

    try {
      // First, deduct credits
      const { error: creditError, data } = await supabase.rpc(
        "handle_credit_transaction",
        {
          p_user_id: profile.id,
          p_amount: -requiredCredits,
          p_type: "generation",
          p_metadata: {
            prompt,
            settings,
            has_reference: !!selectedImage,
          },
        },
      );

      if (creditError) throw new Error("Failed to deduct credits");
      transactionId = data?.id;

      // Then attempt generation
      const output = await generateImage({
        prompt,
        referenceImage: selectedImage,
        ...settings,
      });

      if (!Array.isArray(output)) {
        throw new Error("Invalid generation output");
      }

      // Record successful generation
      const { error: genError } = await supabase.from("generations").insert({
        user_id: profile.id,
        prompt,
        generated_image: output[0], // Store first image
        reference_image: selectedImage,
        parameters: {
          ...settings,
          transaction_id: transactionId,
        },
        credits_used: requiredCredits,
      });

      if (genError) throw new Error("Failed to save generation");

      setGeneratedImages(output);
      toast({
        title: "Generation Complete",
        description: `Successfully generated ${output.length} image${output.length > 1 ? "s" : ""}.`,
      });
    } catch (error) {
      console.error("Generation error:", error);

      // If we deducted credits but generation failed, refund them
      if (transactionId) {
        try {
          await supabase.rpc("handle_credit_transaction", {
            p_user_id: profile.id,
            p_amount: requiredCredits,
            p_type: "refund",
            p_metadata: {
              original_transaction_id: transactionId,
              error: error.message,
            },
          });

          toast({
            title: "Credits Refunded",
            description: `${requiredCredits} credits have been refunded due to the generation error.`,
          });
        } catch (refundError) {
          console.error("Refund error:", refundError);
          toast({
            title: "Refund Error",
            description: "Failed to refund credits. Please contact support.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during image generation.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion: PromptSuggestion) => {
    setPrompt(suggestion.prompt);
    setSuggestions([]);
  };

  const requiredCredits = selectedImage ? 2 : 1;

  return (
    <div className="min-h-screen bg-[#13111C] pt-24 pb-16 px-2 sm:px-4">
      <div className="container mx-auto max-w-6xl">
        <Card className="bg-[#1A1625] border-purple-300/20">
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center gap-6">
              <ImageUploadCard
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onRemove={() => setSelectedImage(undefined)}
              />
              <div className="w-full max-w-2xl relative">
                <div className="relative">
                  <textarea
                    placeholder="Describe the image you want to generate..."
                    className="w-full bg-[#13111C] border border-purple-300/20 text-white px-4 py-3 rounded-full text-center resize-none overflow-hidden transition-all duration-200"
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    style={{
                      minHeight: "48px",
                      maxHeight: "120px",
                    }}
                  />
                </div>
                {suggestions.length > 0 && (
                  <div className="absolute w-full mt-2 bg-[#13111C] border border-purple-300/20 rounded-xl overflow-hidden z-10 shadow-xl">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        className="w-full px-4 py-3 text-left text-white hover:bg-purple-500/20 transition-colors flex items-center gap-3"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="p-1.5 rounded-full bg-purple-500/10">
                          <Wand2 className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="flex-1">{suggestion.prompt}</span>
                        <span className="text-sm text-purple-400/60">
                          {suggestion.score} uses
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full max-w-2xl flex flex-col items-center gap-4">
                <Button
                  className={cn(
                    "w-full max-w-md mx-auto h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full relative overflow-hidden transition-all duration-300",
                    isGenerating && "pl-4 pr-4",
                  )}
                  disabled={!profile?.credits || isGenerating || !prompt}
                  onClick={handleGenerate}
                >
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                      isGenerating ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <div className="absolute inset-0 bg-purple-500/20 backdrop-blur-sm" />
                    <Loader2 className="w-5 h-5 animate-spin text-purple-100" />
                  </div>
                  <span
                    className={cn(
                      "flex items-center justify-center gap-2 transition-opacity duration-300",
                      isGenerating ? "opacity-0" : "opacity-100",
                    )}
                  >
                    <Wand2 className="w-5 h-5" />
                    Generate
                  </span>
                </Button>
                {!isGenerating && (
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300",
                        showAdvanced && "bg-purple-500/20",
                      )}
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      <Settings
                        className={cn(
                          "w-5 h-5 transition-transform duration-300",
                          showAdvanced && "rotate-90",
                        )}
                      />
                    </Button>
                  </div>
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

              {generatedImages.length > 0 && (
                <div className="w-full flex flex-col gap-4">
                  {generatedImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-auto rounded-lg border border-purple-300/20"
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenerationDashboard;
