import OpenAI from "openai";
import {
  ProductBasicInput,
  ProductFullInput,
  GeneratedProduct,
  ImageAnalysis,
  FollowUpQuestion,
  MarketConfig,
  TokenUsage,
} from "@/types";
import { MARKETS } from "@/lib/markets";
import { PLATFORMS } from "@/lib/platforms";

function safeJsonParse<T>(raw: string): T {
  // 1. 先尝试直接解析
  try { return JSON.parse(raw) as T; } catch {}

  // 2. 移除 markdown 代码块标记
  let cleaned = raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?\s*```$/, "");

  // 3. 移除 JSON 字符串值内的控制字符（U+0000 ~ U+001F）
  //    保留 JSON 语法允许的转义：\" \\ \/ \b \f \n \r \t \uXXXX
  cleaned = cleaned.replace(
    /"((?:[^"\\]|\\.)*)"/g,
    (match) => {
      return match.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
    }
  );

  try { return JSON.parse(cleaned) as T; } catch {}

  // 4. 最后手段：尝试修补尾部不完整的 JSON
  //    添加缺失的 } ] "
  const trimmed = cleaned.trimEnd();
  if (!trimmed.endsWith("}") && !trimmed.endsWith('"') && !trimmed.endsWith("]")) {
    let fixed = trimmed;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (const ch of fixed) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{" || ch === "[") depth++;
      if (ch === "}" || ch === "]") depth--;
    }
    while (depth > 0) { fixed += "}"; depth--; }
    try { return JSON.parse(fixed) as T; } catch {}
  }

  return JSON.parse(cleaned) as T;
}

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

// Step 1: 分析产品图片（可选，支持多张）
export async function analyzeProductImage(
  imageBase64s: string[],
  userDescription: string,
  market: MarketConfig
): Promise<ImageAnalysis | null> {
  if (!hasVisionModel()) return null;

  try {
    const imageContents = imageBase64s.map((b64) => ({
      type: "image_url" as const,
      image_url: { url: `data:image/jpeg;base64,${b64}` },
    }));

    const res = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `你是一位电商产品分析专家。用户说这个产品是："${userDescription}"。目标市场：${market.country}（${market.language}）。用户上传了${imageBase64s.length}张产品图片，请综合分析所有图片，从不同角度了解产品。用目标市场的语言返回JSON（不含代码块标记）：
{
  "productType": "产品品类",
  "features": ["特征1", "特征2", "特征3", "特征4", "特征5"],
  "suggestions": "针对${market.country}市场，文案应强调什么？结合图片中看到的产品外观、材质、细节给出建议（80字内，用${market.language}）"
}`,
            },
            ...imageContents,
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = res.choices[0].message.content || "{}";
    return safeJsonParse<ImageAnalysis>(content);
  } catch {
    return null;
  }
}

// Step 2: 根据品类生成追问
export async function generateFollowUpQuestions(
  input: ProductBasicInput,
  imageAnalysis: ImageAnalysis | null
): Promise<{ questions: FollowUpQuestion[]; usage: TokenUsage }> {
  const market = MARKETS[input.targetMarket];
  const platform = PLATFORMS[input.platform || "amazon"];

  let imageContext = "";
  if (imageAnalysis) {
    imageContext = `\n## 图片分析\nAI识别品类：${imageAnalysis.productType}\n特征：${imageAnalysis.features.join("、")}\n建议：${imageAnalysis.suggestions}`;
  }

  const costInfo = fmtCost(input);

  const prompt = `你是一位资深${market.country}电商运营专家。用户要在${market.country}市场销售这个产品：

**产品名**：${input.name}
**品类**：${input.category}
**上架平台**：${platform.name}（${platform.primaryUse}）
**平台重点**：${platform.outputFocus}
${costInfo ? `**成本信息**：${costInfo}` : ""}
${imageContext}

请分析这个品类，找出对${market.country}消费者来说**最重要但用户还没提供**的产品信息。生成4-5个追问。

规则：
- 追问必须针对这个品类的关键卖点（比如服装问面料和尺码，3C产品问规格和兼容性，食品问配料和保质期）
- 追问要结合${platform.name}的填写字段和转化重点：${platform.requiredFields.join("、")}
- 追问要能帮AI写出更有说服力的文案，而不是无聊的行政信息
- 用中文提问（因为用户是中国人），但提示用户答案会被翻译成${market.language}
- 每个追问附带一个placeholder示例

返回严格JSON对象（不含代码块标记）：
{
  "questions": [
    { "id": "q1", "question": "追问内容", "hint": "placeholder示例" },
    { "id": "q2", "question": "追问内容", "hint": "placeholder示例" }
  ]
}`;

  const res = await getDeepseek().chat.completions.create({
    model: "deepseek-chat",
    temperature: 0.7,
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = res.choices[0].message.content || "[]";
  const parsed = safeJsonParse<FollowUpQuestion[] | { questions: FollowUpQuestion[] }>(content);

  const questions = (Array.isArray(parsed) ? parsed : parsed.questions || []).map((q: FollowUpQuestion) => ({
    id: q.id || `q${Math.random().toString(36).slice(2, 6)}`,
    question: q.question || "",
    hint: q.hint || "",
  }));

  return {
    questions,
    usage: {
      model: "deepseek-chat",
      inputTokens: res.usage?.prompt_tokens || 0,
      outputTokens: res.usage?.completion_tokens || 0,
    },
  };
}

// Step 3: 生成全套产品内容
export async function generateProductContent(
  input: ProductFullInput,
  imageAnalysis: ImageAnalysis | null
): Promise<{ result: GeneratedProduct; usage: TokenUsage }> {
  const market = MARKETS[input.targetMarket];
  const platform = PLATFORMS[input.platform || "amazon"];
  const lim = market.charLimits;

  const systemPrompt = `你是一位${market.country}顶级电商文案专家，专门为跨境卖家撰写高转化率产品文案。
你精通${market.language}的电商文案写作，了解${market.country}消费者的购物心理和亚马逊/电商平台SEO最佳实践。

写作原则：
- 所有面向消费者的文案（标题、描述、五点、A+、SEO字段）必须用${market.language}
- 严格遵守字数限制（见下方各字段要求），宁少勿多
- 标题要有搜索友好度但避免关键词堆砌
- 短描述一句勾住买家，突出核心卖点
- 五点描述 (bulletPoints) 是Listing的核心转化模块，每条聚焦一个差异化卖点，5条覆盖功能、质量、场景、售后、情感等不同维度，避免重复。每条以大写字母开头，不含句号结尾
- 长描述讲故事，把产品特点自然转化为购买理由，适当使用HTML换行<br>分段
- 后台搜索词 (backendKeywords) 放标题和描述中塞不下的同义词、拼写变体、外语词、长尾词，每项用英文逗号分隔，不要重复标题已有的词
- A+内容 (aPlusContent) 是品牌展示模块，brandStory写品牌理念（1段），featureModules提供3个图文模块（标题+正文），每个模块讲一个购买理由
- 平台：${platform.name}。平台字段重点：${platform.requiredFields.join("、")}
- ${platform.name}文案风格：${platform.tone}
- 平台输出重点：${platform.outputFocus}
- ${market.country}市场的电商文案风格：${getMarketStyle(input.targetMarket)}
- URL slug 用英文（SEO国际惯例）
- 所有内容必须原创，避免模板化`;

  const answersText = Object.entries(input.answers)
    .map(([id, answer]) => id === "_other" ? `- 用户补充的其他信息：${answer}` : `- ${id}: ${answer}`)
    .join("\n");

  let imageContext = "";
  if (imageAnalysis) {
    imageContext = `\n## AI图片分析\n品类：${imageAnalysis.productType}\n特征：${imageAnalysis.features.join("、")}\n文案建议：${imageAnalysis.suggestions}`;
  }

  let competitorContext = "";
  if (input.competitorReviews) {
    competitorContext = `\n## 竞品差评（用户收集）\n${input.competitorReviews}\n请分析这些差评中暴露的竞品弱点，在你的文案中精准打击这些痛点（但不要直接点名竞品）。同时在competitorInsights字段中用中文总结关键发现。`;
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
- 上架平台：${platform.name}
- 平台字段：${platform.requiredFields.join("、")}
${pricingSection}
## 补充信息（用户回答AI追问）
${answersText}
${imageContext}
${competitorContext}

## 字数限制（必须严格遵守，超限内容会被截断）
- 产品标题：≤${lim.title} 字符
- 短描述：≤${lim.shortDescription} 字符
- 五点描述每条：≤${lim.bulletPoint} 字符
- 后台搜索词总计：≤${lim.backendKeywords} 字符
- 长描述：≤${lim.longDescription} 字符
- 焦点关键词：≤${lim.focusKeyword} 字符
- SEO标题：≤${lim.seoTitle} 字符
- 元描述：≤${lim.metaDescription} 字符
- A+ 模块标题每条：≤${lim.aPlusModuleTitle} 字符
- A+ 模块正文每条：≤${lim.aPlusModuleBody} 字符

返回严格JSON（不含代码块标记），所有面向消费者的文案用${market.language}，competitorInsights用中文：

{
  "title": "产品标题 — SEO友好，≤${lim.title}字符",
  "shortDescription": "一句话短描述，≤${lim.shortDescription}字符",
  "bulletPoints": ["卖点1，≤${lim.bulletPoint}字符", "卖点2", "卖点3", "卖点4", "卖点5"],
  "backendKeywords": "同义词, 拼写变体, 长尾词词组, 外语词 ≤${lim.backendKeywords}字符",
  "platformNotes": ["针对${platform.name}上架时需要注意的填写建议1", "建议2", "建议3"],
  "platformFields": [
    {"label": "${platform.requiredFields[0] || "平台字段"}", "value": "可直接粘贴的平台字段内容"},
    {"label": "${platform.requiredFields[1] || "平台字段"}", "value": "可直接粘贴的平台字段内容"},
    {"label": "${platform.requiredFields[2] || "平台字段"}", "value": "可直接粘贴的平台字段内容"}
  ],
  "longDescription": "详细描述：产品故事、特点、场景、购买理由，≤${lim.longDescription}字符",
  "aPlusContent": {
    "brandStory": "品牌理念文案，用${market.language}",
    "featureModules": [
      {"title": "模块1标题", "body": "模块1正文"},
      {"title": "模块2标题", "body": "模块2正文"},
      {"title": "模块3标题", "body": "模块3正文"}
    ]
  },
  "competitorInsights": "基于竞品差评的关键发现和文案策略（中文，没有竞品数据则填'无竞品数据'）",
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
    max_tokens: 3500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = res.choices[0].message.content || "{}";
  const parsed = safeJsonParse<GeneratedProduct>(content);

  const aPlus = parsed.aPlusContent;
  const featureModules: { title: string; body: string }[] =
    Array.isArray(aPlus?.featureModules)
      ? aPlus.featureModules.slice(0, 3).map((m: { title?: string; body?: string }) => ({
          title: m.title || "",
          body: m.body || "",
        }))
      : [];

  return {
    result: {
      title: parsed.title || "",
      shortDescription: parsed.shortDescription || "",
      longDescription: parsed.longDescription || "",
      bulletPoints: Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints.slice(0, 5) : [],
      backendKeywords: parsed.backendKeywords || "",
      platformNotes: Array.isArray(parsed.platformNotes) ? parsed.platformNotes.slice(0, 5) : [],
      platformFields: Array.isArray(parsed.platformFields)
        ? parsed.platformFields.slice(0, 6).map((field: { label?: string; value?: string }) => ({
            label: field.label || "",
            value: field.value || "",
          })).filter((field) => field.label || field.value)
        : [],
      aPlusContent: {
        brandStory: aPlus?.brandStory || "",
        featureModules,
      },
      competitorInsights: parsed.competitorInsights || undefined,
      productSlug: parsed.productSlug || "",
      seo: {
        focusKeyword: parsed.seo?.focusKeyword || "",
        seoTitle: parsed.seo?.seoTitle || "",
        alias: parsed.seo?.alias || "",
        metaDescription: parsed.seo?.metaDescription || "",
      },
      suggestedPrice: parsed.suggestedPrice || undefined,
    },
    usage: {
      model: "deepseek-chat",
      inputTokens: res.usage?.prompt_tokens || 0,
      outputTokens: res.usage?.completion_tokens || 0,
    },
  };
}

function getMarketStyle(targetMarket: string): string {
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
  return styles[targetMarket] || "专业、信任导向";
}
