export type TargetMarket = "US" | "UK" | "DE" | "FR" | "JP" | "KR" | "ES" | "IT" | "BR" | "MX";

export interface MarketConfig {
  country: string;
  language: string;
  currency: string;
  currencySymbol: string;
  seoLang: string;
  charLimits: CharLimits;
}

export interface CharLimits {
  title: number;
  shortDescription: number;
  longDescription: number;
  bulletPoint: number;
  backendKeywords: number;
  aPlusModuleTitle: number;
  aPlusModuleBody: number;
  focusKeyword: number;
  seoTitle: number;
  metaDescription: number;
}

export interface ProductBasicInput {
  name: string;
  category: string;
  targetMarket: TargetMarket;
  productCost?: number;
  shippingCost?: number;
  profitMargin?: number;
  imageBase64s?: string[];
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  hint: string;
}

export interface ProductFullInput {
  name: string;
  category: string;
  targetMarket: TargetMarket;
  answers: Record<string, string>;
  imageAnalysis: ImageAnalysis | null;
  productCost?: number;
  shippingCost?: number;
  profitMargin?: number;
  competitorReviews?: string;
}

export interface SeoFields {
  focusKeyword: string;
  seoTitle: string;
  alias: string;
  metaDescription: string;
}

export interface APlusModule {
  title: string;
  body: string;
}

export interface GeneratedProduct {
  title: string;
  shortDescription: string;
  longDescription: string;
  bulletPoints: string[];
  backendKeywords: string;
  aPlusContent: {
    brandStory: string;
    featureModules: APlusModule[];
  };
  competitorInsights?: string;
  productSlug: string;
  seo: SeoFields;
  suggestedPrice?: {
    local: string;
    target: string;
    note: string;
  };
}

export interface ImageAnalysis {
  productType: string;
  features: string[];
  suggestions: string;
}

export interface TokenUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
}
