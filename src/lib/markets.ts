import { TargetMarket, MarketConfig, CharLimits } from "@/types";

/** 中/日/韩字符集 — 单字信息密度高，字数上限小 */
const CJK_LIMITS: CharLimits = {
  title: 60,
  shortDescription: 50,
  longDescription: 350,
  focusKeyword: 40,
  seoTitle: 60,
  metaDescription: 160,
};

/** 拉丁语系 — 单词较长，信息密度低，上限翻倍 */
const LATIN_LIMITS: CharLimits = {
  title: 120,
  shortDescription: 80,
  longDescription: 750,
  focusKeyword: 60,
  seoTitle: 80,
  metaDescription: 160,
};

export const MARKETS: Record<TargetMarket, MarketConfig> = {
  US: { country: "美国", language: "English (US)", currency: "USD", currencySymbol: "$", seoLang: "en-US", charLimits: LATIN_LIMITS },
  UK: { country: "英国", language: "English (UK)", currency: "GBP", currencySymbol: "£", seoLang: "en-GB", charLimits: LATIN_LIMITS },
  DE: { country: "德国", language: "Deutsch", currency: "EUR", currencySymbol: "€", seoLang: "de", charLimits: LATIN_LIMITS },
  FR: { country: "法国", language: "Français", currency: "EUR", currencySymbol: "€", seoLang: "fr", charLimits: LATIN_LIMITS },
  ES: { country: "西班牙", language: "Español", currency: "EUR", currencySymbol: "€", seoLang: "es", charLimits: LATIN_LIMITS },
  IT: { country: "意大利", language: "Italiano", currency: "EUR", currencySymbol: "€", seoLang: "it", charLimits: LATIN_LIMITS },
  BR: { country: "巴西", language: "Português (BR)", currency: "BRL", currencySymbol: "R$", seoLang: "pt-BR", charLimits: LATIN_LIMITS },
  MX: { country: "墨西哥", language: "Español (MX)", currency: "MXN", currencySymbol: "MX$", seoLang: "es-MX", charLimits: LATIN_LIMITS },
  JP: { country: "日本", language: "日本語", currency: "JPY", currencySymbol: "¥", seoLang: "ja", charLimits: CJK_LIMITS },
  KR: { country: "韩国", language: "한국어", currency: "KRW", currencySymbol: "₩", seoLang: "ko", charLimits: CJK_LIMITS },
};

export const MARKET_OPTIONS = Object.entries(MARKETS).map(([value, config]) => ({
  value: value as TargetMarket,
  label: `${config.country} (${config.currencySymbol} ${config.currency})`,
}));
