import Replicate from "replicate";
import { supabase } from "./supabase";

let replicate: Replicate | null = null;

export const initReplicate = async () => {
  try {
    const { data: token, error } = await supabase.rpc("get_secret", {
      name: "replicate_api_token",
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
  if (!replicate) {
    await initReplicate();
  }

  if (!replicate) {
    throw new Error("Replicate not initialized");
  }

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

  const output = await replicate.run(model, { input });
  return output;
};
