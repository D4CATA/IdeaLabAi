import { GoogleGenAI, Type } from "@google/genai";
import { AppIdea, VibeState } from "../types";

const APP_IDEA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    successTag: { type: Type.STRING },
    vibeAesthetic: { type: Type.STRING },
    coreConcept: { type: Type.STRING },
    synthesizedBy: { type: Type.STRING },
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
          authorName: { type: Type.STRING },
          quote: { type: Type.STRING }
        },
        required: ["platform", "authorName", "quote"]
      }
    },
    difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] }
  },
  required: [
    "name", "tags", "successTag", "vibeAesthetic", "coreConcept", "synthesizedBy", "toolRecommendation", "originalityScore",
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
5. Why Build This: A compelling, highly motivating reason that highlights the market opportunity and personal leverage.
6. Success Tag: Create a high-energy, 2-word label for the strategy (e.g., "Must Succeed", "High Alpha", "Pure Signal", "Market Disruptor", "Hidden Gem").
7. Synthesized By: Assign an AI Agent persona name (e.g., "Oracle-9", "Neon-Forge", "Alpha-Neural").
8. Social Proof: Provide realistic reviewer names (e.g., "Alex M.", "Founder_X", "Sarah.eth") for each quote.`;

const cleanJsonResponse = (text: string) => {
  return text.replace(/```json\n?|```/g, '').trim();
};

async function generateMockup(ideaName: string, concept: string): Promise<string | undefined> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Using gemini-2.5-flash-image for default image generation as per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{
          text: `A hyper-realistic premium app UI mockup for "${ideaName}". Concept: ${concept}. Glassmorphism, modern typography, sleek smartphone floating in dark cinematic environment. Professional 8k render.`,
        }],
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
  } catch (e) {
    console.error("Mockup generation error:", e);
  }
  return undefined;
}

export const generateAppIdea = async (vibe: VibeState): Promise<AppIdea> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Upgrade to gemini-3-pro-preview for complex reasoning tasks like app strategy generation.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Create a unique ${vibe.blueprintType} app idea. 
      Vibe: ${vibe.mood}. Strategy: ${vibe.creatorMode ? 'High Profit' : 'Viral Growth'}. 
      Wildness: ${vibe.chaosMode ? 'Very Unique' : 'Market Ready'}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: APP_IDEA_SCHEMA,
      }
    });

    // Access the .text property directly as per modern SDK guidelines.
    const text = response.text;
    if (!text) throw new Error("API returned no content");
    
    const cleanedText = cleanJsonResponse(text);
    const idea = JSON.parse(cleanedText) as AppIdea;
    
    // Attempt mockup in parallel/background
    try {
      idea.mockupImageUrl = await generateMockup(idea.name, idea.coreConcept);
    } catch (err) {
      console.warn("Non-critical mockup failure", err);
    }
    
    return idea;
  } catch (error) {
    console.error("Generation service failed:", error);
    throw error;
  }
};

export const mutateAppIdea = async (originalIdea: AppIdea): Promise<AppIdea> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Using gemini-3-pro-preview for advanced logic mutation tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Take this idea and mutate it into a wild variation. 
      Keep it buildable but change the primary logic.
      Original: ${JSON.stringify(originalIdea)}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: APP_IDEA_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Mutation API returned no content");
    const idea = JSON.parse(cleanJsonResponse(text)) as AppIdea;
    idea.mockupImageUrl = await generateMockup(idea.name, idea.coreConcept);
    return idea;
  } catch (error) {
    console.error("Mutation service failed:", error);
    throw error;
  }
};

export const refineAppIdea = async (originalIdea: AppIdea): Promise<AppIdea> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Using gemini-3-pro-preview for detailed refinement and market appeal optimization.
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

    const text = response.text;
    if (!text) throw new Error("Refinement API returned no content");
    const idea = JSON.parse(cleanJsonResponse(text)) as AppIdea;
    idea.mockupImageUrl = originalIdea.mockupImageUrl; 
    return idea;
  } catch (error) {
    console.error("Refinement service failed:", error);
    throw error;
  }
};