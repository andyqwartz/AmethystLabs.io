import Replicate from "replicate";
import { supabase } from "./supabase";

let replicate: Replicate | null = null;

export const initReplicate = async () => {
  try {
    // Get token from vault
    const { data: token, error } = await supabase.rpc("get_secret", {
      p_name: "VITE_REPLICATE_API_TOKEN",
    });

    if (error) {
      console.error("Error fetching Replicate token:", error);
      return null;
    }

    if (!token) {
      console.error("No Replicate token found in vault");
      return null;
    }

    replicate = new Replicate({
      auth: token,
    });

    return token;
  } catch (error) {
    console.error("Error initializing Replicate:", error);
    return null;
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

export { replicate };

const proxyRequest = async (url: string, method: string, body: any) => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/replicate-proxy?url=${encodeURIComponent(url)}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.statusText}`);
  }

  return response.json();
};

export const generateImage = async (params: GenerationParams) => {
  try {
    if (!replicate) {
      throw new Error("Replicate not initialized");
    }

    const { prompt, referenceImage, ...settings } = params;

    const model =
      "lucataco/flux-dev-multi-lora:2389224e115448d9a77c07d7d45672b3f0aa45acacf1c5bcf51857ac295e3aec";

    const output = await proxyRequest("/v1/predictions", "POST", {
      input: {
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
      },
    });

    return output;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
