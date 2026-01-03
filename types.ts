export type LoadingStatus = 'idle' | 'generating' | 'refining' | 'mutating';

export interface AppIdea {
  id: string;
  parentId?: string; // For Evolution Tree
  name: string;
  tags: string[];
  successTag: string; // New: Catchy market tag like "Must Succeed"
  vibeAesthetic: string;
  coreConcept: string;
  synthesizedBy: string; // New: AI Persona name (e.g., "Nexus-7", "Alpha-Mind")
  mockupImageUrl?: string; // AI generated visual
  toolRecommendation: 'Bolt.new' | 'Lovable' | 'v0' | 'Replit Agent' | 'Cursor';
  originalityScore: number;
  marketGaps: string[];
  haloFeature: string; 
  whyBuildThis: string; 
  aiRecommendation: string; 
  aiReasoning: string; 
  promptPrototype: string; 
  keyFeatures: string[];
  isClaimed?: boolean; // Premium Private Feature
  targetAudience: {
    persona: string;
    painPoint: string;
    acquisitionChannel: string;
  };
  competitiveEdge: {
    gap: string;
    unfairAdvantage: string;
    moat: string;
  };
  scalingRoadmap: string[];
  monetization: {
    strategy: string;
    pricingModel: string;
    ltvEstimate: string;
  };
  viralStrategy: {
    tiktokHook: string;
    growthLoop: string;
  };
  socialProof: {
    platform: string;
    authorName: string; // New: Specific nametag for the reviewer
    quote: string;
  }[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface VibeState {
  mood: string;
  chaosMode: boolean;
  creatorMode: boolean;
  blueprintType: 'solid-saas' | 'viral-growth';
}

export interface UserStats {
  generationsLeft: number;
  isPro: boolean;
  blueprintsUnlocked: number;
  credits: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'subscription' | 'credit_pack';
  credits?: number;
  popular?: boolean;
  features: string[];
}

export interface Order {
  id: string;
  productId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
}