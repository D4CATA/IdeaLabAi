
export type LoadingStatus = 'idle' | 'generating' | 'refining';

export interface AppIdea {
  id: string;
  name: string;
  tags: string[];
  vibeAesthetic: string;
  coreConcept: string;
  haloFeature: string; 
  whyBuildThis: string; 
  aiRecommendation: string; 
  aiReasoning: string; 
  promptPrototype: string; 
  keyFeatures: string[];
  techStack: {
    frontend: string;
    backend: string;
    ai: string;
    architecture: string;
  };
  monetization: {
    strategy: string;
    pricingModel: string;
    additionalStreams?: string[];
  };
  viralStrategy: {
    tiktokHook: string;
    growthLoop: string;
  };
  socialProof: {
    platform: string;
    quote: string;
  }[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface VibeState {
  mood: string;
  chaosMode: boolean;
  creatorMode: boolean;
  blueprintType: 'standard' | 'viral-vibe';
}

export interface UserStats {
  generationsLeft: number;
  isPro: boolean;
  blueprintsUnlocked: number;
  credits: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export interface Order {
  id: string;
  productId: string;
  amount: number;
  status: 'pending' | 'completed';
  timestamp: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
