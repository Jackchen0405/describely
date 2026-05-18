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
  imageBase64?: string;
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
}

export interface SeoFields {
  focusKeyword: string;
  seoTitle: string;
  alias: string;
  metaDescription: string;
}

export interface GeneratedProduct {
  title: string;
  shortDescription: string;
  longDescription: string;
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
