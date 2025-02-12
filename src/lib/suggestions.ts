import { supabase } from "./supabase";

export interface PromptSuggestion {
  id: string;
  prompt: string;
  score: number;
}

export const getPromptSuggestions = async (
  input: string,
): Promise<PromptSuggestion[]> => {
  if (!input || input.length < 3) return [];

  // Get suggestions from supabase based on input
  const { data: suggestions, error } = await supabase
    .from("prompts")
    .select("id, prompt, score")
    .textSearch("prompt", input)
    .limit(5);

  if (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }

  return suggestions as PromptSuggestion[];
};
