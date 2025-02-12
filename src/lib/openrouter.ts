const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";

export interface AnnotationResult {
  score: number;
  description: string;
}

export const annotateContent = async (
  prompt: string,
  referenceImageUrl?: string,
  generatedImageUrl?: string,
): Promise<AnnotationResult> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key not found");
  }

  const messages = [
    {
      role: "system",
      content:
        "You are an AI trained to analyze image generation prompts and results for quality and safety.",
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Please analyze this image generation prompt and provide a score from 0-100 and a brief description:\n\nPrompt: ${prompt}`,
        },
        ...(referenceImageUrl
          ? [
              {
                type: "image_url",
                image_url: referenceImageUrl,
              },
            ]
          : []),
        ...(generatedImageUrl
          ? [
              {
                type: "image_url",
                image_url: generatedImageUrl,
              },
            ]
          : []),
      ],
    },
  ];

  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": window.location.origin,
    },
    body: JSON.stringify({
      model: "gpt-4-vision-preview",
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  const result = data.choices[0].message.content;

  // Parse the result to extract score and description
  const scoreMatch = result.match(/\d+/);
  const score = scoreMatch ? parseInt(scoreMatch[0]) : 50;
  const description = result.replace(/\d+/, "").trim();

  return { score, description };
};
