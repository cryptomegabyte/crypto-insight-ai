// Fix: Import `Type` for response schema definition.
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateText = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    return "Gemini API key is not configured. Please check your environment variables.";
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    throw new Error("Failed to communicate with Gemini API.");
  }
};

const generateChartSummary = async (prompt: string): Promise<string> => {
  // This can be expanded with specific model configs for this task in the future
  return generateText(prompt);
};


// Fix: Add fetchNews function to get news articles and a summary from the Gemini API.
const fetchNews = async (topic: string): Promise<{ summary: string; articles: { title: string; uri: string }[] }> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  try {
    const prompt = `Provide a brief summary and a list of 3-5 recent news articles about ${topic}.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A brief summary of the latest news about the topic."
            },
            articles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "The headline of the news article."
                  },
                  uri: {
                    type: Type.STRING,
                    description: "The URL of the news article."
                  },
                },
                required: ['title', 'uri']
              }
            }
          },
          required: ['summary', 'articles']
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error(`Error fetching news for ${topic} with Gemini:`, error);
    throw new Error("Failed to communicate with Gemini API for news.");
  }
};

export const geminiService = {
  generateText,
  generateChartSummary,
  // Fix: Export the new fetchNews function.
  fetchNews,
};