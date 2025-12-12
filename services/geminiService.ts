import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCoverArt = async (songTitle: string): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const prompt = `Design a cool, retro-futuristic pixel art or low-poly album cover for a song titled "${songTitle}". 
    Style: Cyberpunk, Neon Orange and Black, Digital Glitch, 8-bit. 
    Aspect Ratio: 1:1. 
    The image should look like it belongs on an old LED matrix display. High contrast.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
    });

    // Extract the image from the response
    // Depending on the model response structure for images
    // For gemini-2.5-flash-image, it typically returns inlineData in the parts
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error generating cover art:", error);
    return null;
  }
};