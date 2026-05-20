export type TargetMarket = "US" | "UK" | "DE" | "FR" | "JP" | "KR" | "ES" | "IT" | "BR" | "MX";
export type PlatformId = "amazon" | "shopify" | "tiktok" | "woocommerce";
export type CopywritingStyle = "conversion" | "emotional" | "brand" | "test";

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
  platform: PlatformId;
  copywritingStyle?: CopywritingStyle;
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
  platform: PlatformId;
  copywritingStyle?: CopywritingStyle;
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
  platformNotes?: string[];
  platformFields?: {
    label: string;
    value: string;
  }[];
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

export interface AuthUser {
  id: string;
  email?: string;
  name: string;
  avatar?: string;
  provider: "email" | "wechat";
  credits: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface GenerationHistoryEntry {
  id: string;
  userId: string;
  productName: string;
  category: string;
  targetMarket: TargetMarket;
  platform: PlatformId;
  copywritingStyle?: CopywritingStyle;
  result: GeneratedProduct;
  usage: TokenUsage;
  createdAt: string;
}

export type PaymentOrderStatus = "pending" | "paid" | "cancelled" | "expired";
export type PaymentMethod = "manual" | "wechat" | "alipay";

export interface PaymentOrder {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productKind: "plan" | "traffic";
  amountCny: number;
  credits: number;
  status: PaymentOrderStatus;
  paymentMethod: PaymentMethod;
  paidAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditLogEntry {
  id: number | string;
  userId: string;
  change: number;
  reason: string;
  orderId?: string;
  historyId?: string;
  balanceAfter?: number;
  createdAt: string;
}
