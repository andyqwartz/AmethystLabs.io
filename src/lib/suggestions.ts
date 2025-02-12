import { supabase } from "./supabase";
import { annotateContent } from "./openrouter";

export interface PromptSuggestion {
  id: string;
  prompt: string;
  score: number;
  similarity?: number;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small",
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export const getPromptSuggestions = async (
  input: string,
): Promise<PromptSuggestion[]> => {
  if (!input || input.length < 3) return [];

  try {
    // Just use text search for suggestions while typing
    const { data: textResults, error: textError } = await supabase.rpc(
      "search_prompts",
      {
        search_term: input,
        limit_count: 5,
      },
    );

    if (textError) throw textError;
    return textResults || [];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

export const addPromptAnnotation = async (
  prompt: string,
  referenceImageUrl?: string,
  generatedImageUrl?: string,
) => {
  try {
    // Get annotation from OpenRouter
    const annotation = await annotateContent(
      prompt,
      referenceImageUrl,
      generatedImageUrl,
    );

    // Get embedding for the prompt
    const embedding = await getEmbedding(prompt);

    // First, insert or update the prompt
    const { data: promptData, error: promptError } = await supabase
      .from("prompts")
      .upsert(
        {
          prompt,
          score: annotation.score,
          embedding,
        },
        { onConflict: "prompt" },
      )
      .select()
      .single();

    if (promptError) throw promptError;

    // Then, add the annotation
    const { error: annotationError } = await supabase
      .from("prompt_annotations")
      .insert({
        prompt_id: promptData.id,
        reference_image_url: referenceImageUrl,
        generated_image_url: generatedImageUrl,
        moderation_score: annotation.score,
        moderation_description: annotation.description,
      });

    if (annotationError) throw annotationError;

    return { error: null };
  } catch (error) {
    console.error("Error adding prompt annotation:", error);
    return { error };
  }
};
