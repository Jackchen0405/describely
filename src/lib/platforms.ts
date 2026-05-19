import { PlatformId } from "@/types";

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  shortName: string;
  description: string;
  primaryUse: string;
  requiredFields: string[];
  tone: string;
  outputFocus: string;
}

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  amazon: {
    id: "amazon",
    name: "Amazon",
    shortName: "Amazon",
    description: "标题、五点、A+、后台词和合规表达最重要",
    primaryUse: "Marketplace Listing",
    requiredFields: ["产品标题", "五点描述", "长描述", "后台搜索词", "A+ 内容", "定价建议"],
    tone: "搜索友好、利益清晰、避免夸大承诺，强调规格、场景和信任点",
    outputFocus: "优先生成可直接粘贴到 Amazon Listing 的字段，并注意标题和后台词不要重复堆砌。",
  },
  shopify: {
    id: "shopify",
    name: "Shopify",
    shortName: "Shopify",
    description: "独立站商品页，更重视品牌感、故事和转化模块",
    primaryUse: "DTC Product Page",
    requiredFields: ["产品标题", "短描述", "长描述", "SEO 标题", "Meta Description", "URL Slug"],
    tone: "品牌化、清晰、有购买理由，适合独立站商品详情页",
    outputFocus: "优先生成独立站商品页结构，突出品牌语气、首屏短文案、SEO 和转化理由。",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok Shop",
    shortName: "TikTok",
    description: "短视频电商，开头钩子、场景感和转化话术更关键",
    primaryUse: "Social Commerce",
    requiredFields: ["短标题", "短描述", "视频钩子", "直播卖点", "搜索关键词", "定价建议"],
    tone: "直接、口语化、有节奏感，适合短视频和直播间转化",
    outputFocus: "优先生成短视频/直播可用卖点，语言更自然，避免像传统长 Listing。",
  },
  woocommerce: {
    id: "woocommerce",
    name: "WooCommerce / 独立站",
    shortName: "WooCommerce",
    description: "WordPress 独立站商品页，兼顾 SEO、分类和详情页结构",
    primaryUse: "Independent Store",
    requiredFields: ["产品标题", "短描述", "长描述", "分类关键词", "SEO 字段", "URL Slug"],
    tone: "清晰、可信、SEO 友好，适合 WooCommerce 商品页和独立站分类页",
    outputFocus: "优先生成 WooCommerce 商品页需要的短描述、长描述、SEO 字段和分类友好的关键词。",
  },
};

export const PLATFORM_OPTIONS = Object.values(PLATFORMS);
