
import { GoogleGenAI, Type } from "@google/genai";
import { AppIdea, VibeState } from "../types";

const APP_IDEA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    vibeAesthetic: { type: Type.STRING },
    coreConcept: { type: Type.STRING },
    toolRecommendation: { type: Type.STRING, enum: ['Bolt.new', 'Lovable', 'v0', 'Replit Agent', 'Cursor'] },
    originalityScore: { type: Type.NUMBER },
    marketGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
    haloFeature: { type: Type.STRING },
    whyBuildThis: { type: Type.STRING },
    aiRecommendation: { type: Type.STRING },
    aiReasoning: { type: Type.STRING },
    promptPrototype: { type: Type.STRING },
    keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
    targetAudience: {
      type: Type.OBJECT,
      properties: {
        persona: { type: Type.STRING },
        painPoint: { type: Type.STRING },
        acquisitionChannel: { type: Type.STRING }
      },
      required: ["persona", "painPoint", "acquisitionChannel"]
    },
    competitiveEdge: {
      type: Type.OBJECT,
      properties: {
        gap: { type: Type.STRING },
        unfairAdvantage: { type: Type.STRING },
        moat: { type: Type.STRING }
      },
      required: ["gap", "unfairAdvantage", "moat"]
    },
    scalingRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
    monetization: {
      type: Type.OBJECT,
      properties: {
        strategy: { type: Type.STRING },
        pricingModel: { type: Type.STRING },
        ltvEstimate: { type: Type.STRING }
      },
      required: ["strategy", "pricingModel", "ltvEstimate"]
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
    "name", "tags", "vibeAesthetic", "coreConcept", "toolRecommendation", "originalityScore",
    "marketGaps", "haloFeature", "whyBuildThis", "aiRecommendation", "aiReasoning", "promptPrototype", 
    "keyFeatures", "targetAudience", "competitiveEdge", "scalingRoadmap", 
    "monetization", "viralStrategy", "socialProof", "difficulty"
  ]
};

const SYSTEM_INSTRUCTION = `You are a creative App Strategist. 
Generate unique, attractive app ideas that one person can build using modern tools.
1. Be specific. No generic ideas.
2. Originality Score: 1-100 (Be honest about competition).
3. Tool Choice: Bolt.new, Lovable, v0, etc.
4. Prompt Prototype: 800+ word execution roadmap.
5. Why Build This: A compelling, highly motivating reason that highlights the market opportunity and personal leverage.`;

async function generateMockup(ideaName: string, concept: string): Promise<string | undefined> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Fix: Use the standard object format for contents as recommended in SDK documentation.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{
          text: `A hyper-realistic, ultra-premium app UI mockup for a revolutionary app called "${ideaName}". 
          The app concept is: ${concept}. 
          Visual Style: Minimalist glassmorphism, sleek modern typography, vibrant accent colors, high-end product photography lighting. 
          The mockup should be shown on a high-resolution smartphone floating in a clean, dark cinematic environment with subtle depth-of-field blur. 
          Professional 8k render, trending on Dribbble and Behance.`,
        }],
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.warn("Mockup generation failed", e);
  }
  return undefined;
}

export const generateAppIdea = async (vibe: VibeState): Promise<AppIdea> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a unique ${vibe.blueprintType} app idea. 
    Vibe: ${vibe.mood}. Strategy: ${vibe.creatorMode ? 'High Profit' : 'Viral Growth'}. 
    Wildness: ${vibe.chaosMode ? 'Very Unique' : 'Market Ready'}.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: APP_IDEA_SCHEMA,
    }
  });

  if (!response.text) throw new Error("Generation Failed");
  const idea = JSON.parse(response.text.trim()) as AppIdea;
  
  // Parallel generate mockup
  idea.mockupImageUrl = await generateMockup(idea.name, idea.coreConcept);
  
  return idea;
};

export const mutateAppIdea = async (originalIdea: AppIdea): Promise<AppIdea> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Take this idea and mutate it into a wild variation. 
    Change the core audience or mechanic. Keep it buildable.
    Idea: ${JSON.stringify(originalIdea)}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: APP_IDEA_SCHEMA,
    }
  });

  if (!response.text) throw new Error("Mutation Failed");
  const idea = JSON.parse(response.text.trim()) as AppIdea;
  idea.mockupImageUrl = await generateMockup(idea.name, idea.coreConcept);
  return idea;
};

export const refineAppIdea = async (originalIdea: AppIdea): Promise<AppIdea> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Refine this strategy for maximum market appeal.
    Original Idea: ${JSON.stringify(originalIdea)}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: APP_IDEA_SCHEMA,
    }
  });

  if (!response.text) throw new Error("Refinement Failed");
  const idea = JSON.parse(response.text.trim()) as AppIdea;
  idea.mockupImageUrl = originalIdea.mockupImageUrl; // Reuse mockup if refining logic
  return idea;
};
