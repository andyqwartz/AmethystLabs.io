import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Wand2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import ImageUploadCard from "./ImageUploadCard";
import AdvancedSettings from "./AdvancedSettings";
import { generateImage } from "@/lib/replicate";
import { getPromptSuggestions, PromptSuggestion } from "@/lib/suggestions";
import { cn } from "@/lib/utils";

const GenerationDashboard = () => {
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
    <div className="min-h-screen bg-[#13111C] pt-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <Card className="bg-[#1A1625] border-purple-300/20">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              Generate Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-6">
              <ImageUploadCard
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onRemove={() => setSelectedImage(undefined)}
              />
              <div className="w-full max-w-2xl relative">
                <Textarea
                  placeholder="Describe the image you want to generate..."
                  className="bg-[#13111C] border-purple-300/20 text-white min-h-[120px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                {suggestions.length > 0 && (
                  <div className="absolute w-full mt-1 bg-[#13111C] border border-purple-300/20 rounded-md overflow-hidden z-10">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        className="w-full px-4 py-2 text-left text-white hover:bg-purple-500/20 transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full max-w-2xl flex flex-col items-center gap-4">
                <Button
                  className={cn(
                    "w-full bg-purple-600 hover:bg-purple-700 text-white",
                    isGenerating && "opacity-80 cursor-not-allowed",
                  )}
                  disabled={!profile?.credits || isGenerating || !prompt}
                  onClick={handleGenerate}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    `Generate (${requiredCredits} Credit${requiredCredits > 1 ? "s" : ""})`
                  )}
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
