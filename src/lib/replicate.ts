import Replicate from "replicate";
import { supabase } from "./supabase";

let replicate: Replicate | null = null;

export const initReplicate = async () => {
  try {
    // Get token from RPC function
    const { data: token, error } = await supabase.rpc("get_secret_value", {
      p_name: "VITE_REPLICATE_API_TOKEN",
    });

    if (error) {
      console.error("Error fetching Replicate token:", error);
      return;
    }

    if (!token) {
      console.error("No Replicate token found in vault");
      return;
    }

    replicate = new Replicate({
      auth: token,
    });
  } catch (error) {
    console.error("Error initializing Replicate:", error);
  }
};

export interface GenerationParams {
  prompt: string;
  referenceImage?: string;
  aspectRatio: string;
  promptStrength: number;
  numOutputs: number;
  numInferenceSteps: number;
  guidanceScale: number;
  outputFormat: string;
  outputQuality: number;
  seed?: number;
  hfLoras?: string[];
  loraScales?: number[];
  disableSafetyChecker?: boolean;
}

export const generateImage = async (params: GenerationParams) => {
  try {
    const { prompt, referenceImage, ...settings } = params;

    const model =
      "lucataco/flux-dev-multi-lora:2389224e115448d9a77c07d7d45672b3f0aa45acacf1c5bcf51857ac295e3aec";

    const input = {
      prompt,
      image: referenceImage,
      aspect_ratio: settings.aspectRatio,
      prompt_strength: settings.promptStrength,
      num_outputs: settings.numOutputs,
      num_inference_steps: settings.numInferenceSteps,
      guidance_scale: settings.guidanceScale,
      output_format: settings.outputFormat,
      output_quality: settings.outputQuality,
      seed: settings.seed,
      hf_loras: settings.hfLoras,
      lora_scales: settings.loraScales,
      disable_safety_checker: settings.disableSafetyChecker,
    };

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/functions/v1/replicate`,

      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ model, input }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate image");
    }

    const result = await response.json();
    if (result.status === "succeeded" && result.output) {
      return result.output;
    } else {
      throw new Error(result.error || "Generation failed");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
