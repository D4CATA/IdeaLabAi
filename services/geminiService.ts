
import { GoogleGenAI, Type } from "@google/genai";
import { AppIdea, VibeState } from "../types";

const APP_IDEA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    tags: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Simple labels like 'Money Maker', 'Viral Tool', 'Clean App'"
    },
    vibeAesthetic: { type: Type.STRING },
    coreConcept: { type: Type.STRING },
    haloFeature: { type: Type.STRING },
    whyBuildThis: { type: Type.STRING, description: "The direct reason this app will be successful and make money fast." },
    aiRecommendation: { 
      type: Type.STRING,
      description: "The best Vibe Coding tool: Bolt.new, Lovable.dev, Replit Agent, Cursor, or v0.dev."
    },
    aiReasoning: {
      type: Type.STRING,
      description: "Deep explanation of why this specific AI tool is the best for this project (e.g., 'v0 is perfect for the Shadcn/UI aesthetic required for this landing page', or 'Lovable's state management handles this complex logic better')."
    },
    promptPrototype: { type: Type.STRING },
    keyFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: 5,
      maxItems: 6
    },
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
        strategy: { type: Type.STRING, description: "Exactly how this app makes money." },
        pricingModel: { type: Type.STRING, description: "Exact pricing like $15/month or $2 per use." },
        additionalStreams: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Extra ways to earn: Ads, Premium features, selling data."
        }
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
    difficulty: { 
      type: Type.STRING, 
      enum: ['Beginner', 'Intermediate', 'Advanced'] 
    }
  },
  required: [
    "name", "tags", "vibeAesthetic", "coreConcept", "haloFeature", 
    "whyBuildThis", "aiRecommendation", "aiReasoning", "promptPrototype", 
    "keyFeatures", "techStack", "monetization", "viralStrategy", "socialProof", "difficulty"
  ]
};

const cleanJsonResponse = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const generateAppIdea = async (vibe: VibeState): Promise<AppIdea> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Act as an App Success Architect with access to 1.5 million viral patterns.
    
    TASK: Generate a viral, money-making app idea for the ACCESS ENGINE.
    VIBE CODING TOOLS TO CHOOSE FROM: Bolt.new, Lovable.dev, Replit Agent, Cursor, v0.dev.

    RULES:
    1. VIBE CODING FOCUS: Design a killer aesthetic.
    2. STRATEGY: Be clear on why this makes money.
    3. AI TOOL REASONING: Explain EXACTLY why the chosen Vibe Coding tool is superior for this specific execution. 
    4. PROMPT: The prototype prompt must be a master-level "vibe code" prompt (minimum 400 words).

    User Context:
    - Vibe Mood: ${vibe.mood}
    - Revenue Focus: ${vibe.creatorMode ? 'High Scaling' : 'Steady Cash Flow'}
    - Engine Mode: ${vibe.blueprintType}

    Return a valid JSON object strictly following the schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Fixed to use requested pro model
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: APP_IDEA_SCHEMA
    }
  });

  const textOutput = response.text;
  if (!textOutput) throw new Error("Empty response from pattern engine.");
  
  try {
    return JSON.parse(cleanJsonResponse(textOutput)) as AppIdea;
  } catch (e) {
    console.error("JSON Parse Error:", e, "Raw output:", textOutput);
    throw new Error("Pattern engine returned invalid data format.");
  }
};

export const refineAppIdea = async (originalIdea: AppIdea): Promise<AppIdea> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Refine this app into a Viral Masterpiece using the ACCESS ENGINE protocol.
    Original: ${JSON.stringify(originalIdea)}
    
    GOAL:
    1. PROFIT: Maximize ROI.
    2. THE MASTER PROMPT: Create an 800-word, high-fidelity vibe coding prompt.
    3. AI TOOL: Verify and refine the tool pairing reasoning.
    
    Return a valid JSON object strictly following the schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: APP_IDEA_SCHEMA
    }
  });

  const textOutput = response.text;
  if (!textOutput) throw new Error("Empty response from refinement engine.");
  
  try {
    return JSON.parse(cleanJsonResponse(textOutput)) as AppIdea;
  } catch (e) {
    console.error("Refinement JSON Parse Error:", e, "Raw output:", textOutput);
    throw new Error("Refinement engine returned invalid data format.");
  }
};
