import OpenAI from "openai";
import {
  ProductBasicInput,
  ProductFullInput,
  GeneratedProduct,
  ImageAnalysis,
  FollowUpQuestion,
  MarketConfig,
} from "@/types";
import { MARKETS } from "@/lib/markets";

let _deepseek: OpenAI | null = null;
let _openai: OpenAI | null = null;

function getDeepseek() {
  if (!_deepseek)
    _deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || "missing",
      baseURL: "https://api.deepseek.com/v1",
    });
  return _deepseek;
}

function getOpenAI() {
  if (!_openai)
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "missing" });
  return _openai;
}

function hasVisionModel() {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10;
}

function fmtCost(input: ProductBasicInput): string {
  const parts: string[] = [];
  if (input.productCost != null) parts.push(`拿货价 ¥${input.productCost}`);
  if (input.shippingCost != null) parts.push(`物流 ¥${input.shippingCost}`);
  if (input.productCost != null && input.shippingCost != null) {
    parts.push(`合计成本 ¥${input.productCost + input.shippingCost}`);
  }
  if (input.profitMargin != null) parts.push(`期望利润率 ${input.profitMargin}%`);
  return parts.length > 0 ? parts.join("，") : "";
}

// Step 1: 分析产品图片（可选）
export async function analyzeProductImage(
  imageBase64: string,
  userDescription: string,
  market: MarketConfig
): Promise<ImageAnalysis | null> {
  if (!hasVisionModel()) return null;

  try {
    const res = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `你是一位电商产品分析专家。用户说这个产品是："${userDescription}"。目标市场：${market.country}（${market.language}）。请分析这张产品图片，用目标市场的语言返回JSON（不含代码块标记）：
{
  "productType": "产品品类",
  "features": ["特征1", "特征2", "特征3"],
  "suggestions": "针对${market.country}市场，文案应强调什么？（50字内，用${market.language}）"
}`,
            },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = res.choices[0].message.content || "{}";
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Step 2: 根据品类生成追问
export async function generateFollowUpQuestions(
  input: ProductBasicInput,
  imageAnalysis: ImageAnalysis | null
): Promise<FollowUpQuestion[]> {
  const market = MARKETS[input.targetMarket];

  let imageContext = "";
  if (imageAnalysis) {
    imageContext = `\n## 图片分析\nAI识别品类：${imageAnalysis.productType}\n特征：${imageAnalysis.features.join("、")}\n建议：${imageAnalysis.suggestions}`;
  }

  const costInfo = fmtCost(input);

  const prompt = `你是一位资深${market.country}电商运营专家。用户要在${market.country}市场销售这个产品：

**产品名**：${input.name}
**品类**：${input.category}
${costInfo ? `**成本信息**：${costInfo}` : ""}
${imageContext}

请分析这个品类，找出对${market.country}消费者来说**最重要但用户还没提供**的产品信息。生成4-5个追问。

规则：
- 追问必须针对这个品类的关键卖点（比如服装问面料和尺码，3C产品问规格和兼容性，食品问配料和保质期）
- 追问要能帮AI写出更有说服力的文案，而不是无聊的行政信息
- 用中文提问（因为用户是中国人），但提示用户答案会被翻译成${market.language}
- 每个追问附带一个placeholder示例

返回严格JSON数组（不含代码块标记）：
[
  { "id": "q1", "question": "追问内容", "hint": "placeholder示例" },
  { "id": "q2", "question": "追问内容", "hint": "placeholder示例" }
]`;

  const res = await getDeepseek().chat.completions.create({
    model: "deepseek-chat",
    temperature: 0.7,
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = res.choices[0].message.content || "[]";
  const parsed = JSON.parse(content);

  const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
  return questions.map((q: FollowUpQuestion) => ({
    id: q.id || `q${Math.random().toString(36).slice(2, 6)}`,
    question: q.question || "",
    hint: q.hint || "",
  }));
}

// Step 3: 生成全套产品内容
export async function generateProductContent(
  input: ProductFullInput,
  imageAnalysis: ImageAnalysis | null
): Promise<GeneratedProduct> {
  const market = MARKETS[input.targetMarket];
  const lim = market.charLimits;

  const systemPrompt = `你是一位${market.country}顶级电商文案专家，专门为跨境卖家撰写高转化率产品文案。
你精通${market.language}的电商文案写作，了解${market.country}消费者的购物心理和SEO最佳实践。

写作原则：
- 所有面向消费者的文案（标题、描述、SEO字段）必须用${market.language}
- 严格遵守字数限制（见下方各字段要求），宁少勿多
- 标题要有搜索友好度但避免关键词堆砌
- 短描述一句勾住买家，突出核心卖点
- 长描述讲故事，把产品特点自然转化为购买理由
- ${market.country}市场的电商文案风格：${getMarketStyle(market)}
- URL slug 用英文（SEO国际惯例）
- 所有内容必须原创，避免模板化`;

  const answersText = Object.entries(input.answers)
    .map(([id, answer]) => `- ${id}: ${answer}`)
    .join("\n");

  let imageContext = "";
  if (imageAnalysis) {
    imageContext = `\n## AI图片分析\n品类：${imageAnalysis.productType}\n特征：${imageAnalysis.features.join("、")}\n文案建议：${imageAnalysis.suggestions}`;
  }

  let pricingSection = "";
  if (input.productCost != null) {
    const totalCost = input.productCost + (input.shippingCost || 0);
    const margin = input.profitMargin || 40;
    pricingSection = `\n- 产品拿货价：¥${input.productCost} CNY\n- 物流费用：¥${input.shippingCost || 0} CNY\n- 合计成本：¥${totalCost} CNY\n- 期望利润率：${margin}%\n- 请基于${market.country}市场价格水平，给出建议${market.currency}售价区间和定价策略（在suggestedPrice字段中）`;
  }

  const userPrompt = `为以下产品生成${market.country}市场全套电商文案。

## 产品信息
- 产品名：${input.name}
- 品类：${input.category}
- 目标市场：${market.country}（${market.language} / ${market.currency}）
${pricingSection}
## 补充信息（用户回答AI追问）
${answersText}
${imageContext}

## 字数限制（必须严格遵守，超限内容会被截断）
- 产品标题：≤${lim.title} 字符
- 短描述：≤${lim.shortDescription} 字符
- 长描述：≤${lim.longDescription} 字符
- 焦点关键词：≤${lim.focusKeyword} 字符
- SEO标题：≤${lim.seoTitle} 字符
- 元描述：≤${lim.metaDescription} 字符

返回严格JSON（不含代码块标记），所有文案字段用${market.language}：

{
  "title": "产品标题 — SEO友好，≤${lim.title}字符",
  "shortDescription": "一句话短描述，≤${lim.shortDescription}字符",
  "longDescription": "详细描述：产品故事、特点、场景、购买理由，≤${lim.longDescription}字符",
  "productSlug": "英文URL slug",
  "seo": {
    "focusKeyword": "焦点关键词，≤${lim.focusKeyword}字符",
    "seoTitle": "SEO标题，≤${lim.seoTitle}字符",
    "alias": "产品别名（1-3个，逗号分隔）",
    "metaDescription": "元描述，≤${lim.metaDescription}字符"
  },
  "suggestedPrice": {
    "local": "建议${market.currency}售价区间",
    "target": "建议${market.currency}精确售价",
    "note": "定价理由（1-2句，用中文）"
  }
}`;

  const res = await getDeepseek().chat.completions.create({
    model: "deepseek-chat",
    temperature: 0.85,
    max_tokens: 2500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = res.choices[0].message.content || "{}";
  const parsed = JSON.parse(content);

  return {
    title: parsed.title || "",
    shortDescription: parsed.shortDescription || "",
    longDescription: parsed.longDescription || "",
    productSlug: parsed.productSlug || "",
    seo: {
      focusKeyword: parsed.seo?.focusKeyword || "",
      seoTitle: parsed.seo?.seoTitle || "",
      alias: parsed.seo?.alias || "",
      metaDescription: parsed.seo?.metaDescription || "",
    },
    suggestedPrice: parsed.suggestedPrice || undefined,
  };
}

function getMarketStyle(market: MarketConfig): string {
  const styles: Record<string, string> = {
    US: "直接、利益导向、强调价值和生活方式",
    UK: "优雅克制、强调品质和传统",
    DE: "理性客观、重视技术参数和认证、避免夸大",
    FR: "感性浪漫、强调设计和品味",
    JP: "细腻谦逊、强调匠心和使用体验",
    KR: "时尚潮流、强调设计和性价比",
    ES: "热情感性、强调生活品质",
    IT: "时尚精致、强调设计和工艺",
    BR: "热情直接、强调性价比和社交属性",
    MX: "热情友好、强调家庭和实用性",
  };
  return styles[market.country] || "专业、信任导向";
}
