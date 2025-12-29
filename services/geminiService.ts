
import { GoogleGenAI, Type } from "@google/genai";
import { AppIdea, VibeState } from "../types";

const APP_IDEA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    vibeAesthetic: { type: Type.STRING },
    coreConcept: { type: Type.STRING },
    haloFeature: { type: Type.STRING },
    whyBuildThis: { type: Type.STRING },
    aiRecommendation: { type: Type.STRING },
    aiReasoning: { type: Type.STRING },
    promptPrototype: { type: Type.STRING },
    keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
    techStack: {
      type: Type.OBJECT,
      properties: {
        frontend: { type: Type.STRING },
        backend: { type: Type.STRING },
        ai: { type: Type.STRING },
        architecture: { type: Type.STRING }
      },
      required: ["frontend", "backend", "ai", "architecture"]
    },
    monetization: {
      type: Type.OBJECT,
      properties: {
        strategy: { type: Type.STRING },
        pricingModel: { type: Type.STRING },
        additionalStreams: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["strategy", "pricingModel", "additionalStreams"]
    },
    viralStrategy: {
      type: Type.OBJECT,
      properties: {
        tiktokHook: { type: Type.STRING },
        growthLoop: { type: Type.STRING }
      },
      required: ["tiktokHook", "growthLoop"]
    },
    socialProof: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING },
          quote: { type: Type.STRING }
        },
        required: ["platform", "quote"]
      }
    },
    difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] }
  },
  required: [
    "name", "tags", "vibeAesthetic", "coreConcept", "haloFeature", 
    "whyBuildThis", "aiRecommendation", "aiReasoning", "promptPrototype", 
    "keyFeatures", "techStack", "monetization", "viralStrategy", "socialProof", "difficulty"
  ]
};

const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
];

// Use gemini-3-pro-preview for complex reasoning tasks as per guidelines.
export const generateAppIdea = async (vibe: VibeState): Promise<AppIdea> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Architect viral app patterns for ${vibe.mood}. Strategy: ${vibe.creatorMode ? 'Profit Max' : 'Sustainability'}. Protocol: ${vibe.blueprintType}. Ensure tool alignment for ${vibe.mood} aesthetic.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: APP_IDEA_SCHEMA,
      // @ts-ignore
      safetySettings 
    }
  });
  if (!response.text) throw new Error("Synthesis Null");
  return JSON.parse(response.text.trim()) as AppIdea;
};

// Use gemini-3-pro-preview for refinement reasoning.
export const refineAppIdea = async (originalIdea: AppIdea): Promise<AppIdea> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Refine logic for pattern ID ${originalIdea.id}. Deepen monetization and growth loops. Original: ${originalIdea.name}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: APP_IDEA_SCHEMA,
      // @ts-ignore
      safetySettings
    }
  });
  if (!response.text) throw new Error("Refinement Null");
  return JSON.parse(response.text.trim()) as AppIdea;
};
