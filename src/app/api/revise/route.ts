import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const FIELD_LABELS: Record<string, string> = {
  title: "产品标题",
  shortDescription: "短描述",
  bulletPoint: "五点描述中的一条",
  longDescription: "长描述",
  backendKeywords: "后台搜索词",
  aPlusBrandStory: "A+品牌故事",
  aPlusModuleTitle: "A+模块标题",
  aPlusModuleBody: "A+模块正文",
};

export async function POST(req: NextRequest) {
  try {
    const { fieldType, currentValue, instruction, productName, category, language, charLimit } = await req.json();

    if (!fieldType || !currentValue || !instruction) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const fieldLabel = FIELD_LABELS[fieldType] || fieldType;

    const deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || "missing",
      baseURL: "https://api.deepseek.com/v1",
    });

    const res = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      temperature: 0.8,
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content: `你是一位电商文案修改专家。用户对已生成的${fieldLabel}不满意，请你根据用户的修改意见重新改写。只返回改写后的纯文本，不要加引号、解释或前缀。语言：${language}。${charLimit ? `严格控制在${charLimit}字符以内。` : ""}`,
        },
        {
          role: "user",
          content: `产品：${productName}（${category}）

当前${fieldLabel}：
${currentValue}

修改要求：${instruction}

请直接输出修改后的${fieldLabel}：`,
        },
      ],
    });

    const revised = res.choices[0].message.content || currentValue;

    return NextResponse.json({
      revised: revised.trim(),
      usage: {
        model: "deepseek-chat",
        inputTokens: res.usage?.prompt_tokens || 0,
        outputTokens: res.usage?.completion_tokens || 0,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "修改失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
